import { join } from "path";
import type { FileSink } from "bun";
import type { LogEvent, LogSource } from "../hooks/index.ts";

interface TuiDebugSessionOptions {
    appName: string;
    logSource: LogSource;
}

/**
 * Manages streaming log events to a run-scoped file when debug mode is enabled.
 */
export class TuiDebugSession {
    private readonly startedAt = new Date();
    private readonly logFilePath: string;
    private unsubscribe?: () => void;
    private sink?: FileSink;

    constructor(private readonly options: TuiDebugSessionOptions) {
        this.logFilePath = join(process.cwd(), this.buildFileName(options.appName, this.startedAt));
    }

    start(): void {
        if (this.sink) {
            return;
        }

        try {
            const file = Bun.file(this.logFilePath);
            this.sink = file.writer();
            this.sink.start?.();
        } catch {
            this.sink = undefined;
            return;
        }

        this.unsubscribe = this.options.logSource.subscribe((event) => {
            const formatted = this.formatLine(event);
            this.sink?.write(formatted);
        });
    }

    stop(): void {
        this.unsubscribe?.();
        this.unsubscribe = undefined;

        if (this.sink) {
            try {
                const flushResult = this.sink.flush?.();
                if (flushResult instanceof Promise) {
                    void flushResult.catch(() => {});
                }
            } catch {
                // Ignore flush errors during shutdown
            }

            try {
                const endResult = this.sink.end?.();
                if (endResult instanceof Promise) {
                    void endResult.catch(() => {});
                }
            } catch {
                // Ignore end errors during shutdown
            }
        }

        this.sink = undefined;
    }

    getFilePath(): string {
        return this.logFilePath;
    }

    private formatLine(event: LogEvent): string {
        const timestamp = event.timestamp instanceof Date
            ? event.timestamp
            : event.timestamp
                ? new Date(event.timestamp)
                : new Date();
        const level = typeof event.level === "string" ? event.level.toUpperCase() : String(event.level);
        const message = this.stripAnsi(event.message);
        return `[${timestamp.toISOString()}] [${level}] ${message}\n`;
    }

    private buildFileName(appName: string, startedAt: Date): string {
        const safeName = appName.replace(/[^a-zA-Z0-9_-]+/g, "-");
        const pad = (value: number) => value.toString().padStart(2, "0");
        const timestamp = `${startedAt.getFullYear()}${pad(startedAt.getMonth() + 1)}${pad(startedAt.getDate())}-${pad(startedAt.getHours())}${pad(startedAt.getMinutes())}${pad(startedAt.getSeconds())}`;
        return `${safeName}-${timestamp}.log`;
    }

    private stripAnsi(value: string): string {
        if (typeof Bun !== "undefined" && typeof Bun.stripANSI === "function") {
            return Bun.stripANSI(value).trimEnd();
        }
        return value.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "").trimEnd();
    }
}
