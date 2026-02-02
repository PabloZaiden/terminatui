import { LogLevel, type LogEvent } from "../../core/logger.ts";
import type { NavigationAPI } from "../context/NavigationContext.tsx";

import { RenderLogsScreen } from "../semantic/render.tsx";

import type { CopyPayload } from "../driver/types.ts";

export class LogsController {
    private navigation: NavigationAPI;

    public constructor({ navigation }: { navigation: NavigationAPI }) {
        this.navigation = navigation;
    }

    public getCopyPayload(logs: LogEvent[]): CopyPayload {
        const text = this.formatLogText(logs);
        return { label: "Logs", content: text };
    }

    public render(logs: LogEvent[]): React.ReactNode {
        const items = this.formatLogItems(logs);

        return (
            <RenderLogsScreen
                key="modal-logs"
                items={items}
                onClose={() => this.navigation.closeModal()}
            />
        );
    }

    private formatLogItems(logs: LogEvent[]): { level: string; message: string; timestamp: number }[] {
        return logs.map((l) => ({
            level: LogLevel[l.level],
            message: l.message,
            timestamp: l.timestamp.getTime(),
        }));
    }

    private formatLogText(logs: LogEvent[]): string {
        return logs
            .map((l) => {
                const timestamp = l.timestamp.toISOString();
                return `[${timestamp}] ${LogLevel[l.level].toUpperCase()}: ${l.message}`;
            })
            .join("\n");
    }
}
