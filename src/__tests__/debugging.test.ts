import { describe, expect, test } from "bun:test";
import { rm } from "fs/promises";
import { Logger, LogLevel as CoreLogLevel } from "../core/logger.ts";
import { TuiDebugSession } from "../tui/debug/TuiDebugSession.ts";
import { LogLevel as TuiLogLevel, type LogSource, type LogEvent as TuiLogEvent } from "../tui/hooks/useLogStream.ts";

function createTestLogSource() {
    let listener: ((event: TuiLogEvent) => void) | undefined;

    const source: LogSource = {
        subscribe: (callback) => {
            listener = callback;
            return () => {
                listener = undefined;
            };
        },
    };

    return {
        source,
        emit: (event: TuiLogEvent) => listener?.(event),
    };
}

describe("Debugging utilities", () => {
    test("streams log events to a debug file", async () => {
        const { source, emit } = createTestLogSource();
        const session = new TuiDebugSession({ appName: "sample-app", logSource: source });

        session.start();

        emit({ level: TuiLogLevel.Info, message: "started", timestamp: new Date("2026-01-10T12:00:00Z") });
        emit({ level: TuiLogLevel.Error, message: "something broke" });

        session.stop();

        // Allow the sink to flush to disk
        await new Promise((resolve) => setTimeout(resolve, 10));

        const filePath = session.getFilePath();
        const contents = await Bun.file(filePath).text();

        expect(contents).toContain("[2026-01-10T12:00:00.000Z]");
        expect(contents).toContain("[INFO] started");
        expect(contents).toContain("[ERROR] something broke");

        await rm(filePath).catch(() => {});
    });

    test("logger emits events even when TUI mode is disabled", () => {
        const logger = new Logger({ tuiMode: false });
        const events: string[] = [];
        const unsubscribe = logger.onLogEvent((event) => {
            events.push(event.message);
        });

        const originalWrite = process.stderr.write;
        // Silence stderr for this test
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        process.stderr.write = (() => true) as any;
        try {
            logger.warn("debug-event-test");
        } finally {
            process.stderr.write = originalWrite;
        }

        unsubscribe();

        expect(events.some((line) => line.includes("debug-event-test"))).toBe(true);
        expect(logger.getMinLevel()).toBe(CoreLogLevel.Info);
    });
});
