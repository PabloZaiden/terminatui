import type { LogEvent } from "../../core/logger.ts";
import type { NavigationAPI } from "../context/NavigationContext.tsx";

import { RenderLogsScreen } from "../semantic/render.tsx";

import type { CopyPayload } from "../driver/types.ts";

export class LogsController {
    private navigation: NavigationAPI;

    public constructor({ navigation }: { navigation: NavigationAPI }) {
        this.navigation = navigation;
    }

    public getCopyPayload(logs: LogEvent[]): CopyPayload {
        const text = this.formatLogText(logs, { maxLines: 200 });
        return { label: "Logs", content: text };
    }

    public render(logs: LogEvent[]): React.ReactNode {
        const items = this.formatLogItems(logs, { maxItems: 2_000 });

        return (
            <RenderLogsScreen
                key="modal-logs"
                items={items}
                onClose={() => this.navigation.closeModal()}
            />
        );
    }

    private formatLogItems(
        logs: LogEvent[],
        { maxItems }: { maxItems: number }
    ): { level: string; message: string; timestamp: number }[] {
        return logs.slice(-maxItems).map((l) => ({
            level: String(l.level),
            message: String(l.message),
            timestamp: l.timestamp.getTime(),
        }));
    }

    private formatLogText(logs: LogEvent[], { maxLines }: { maxLines: number }): string {
        return logs
            .slice(-maxLines)
            .map((l) => {
                const timestamp = l.timestamp.toISOString();
                return `[${timestamp}] ${String(l.level).toUpperCase()}: ${String(l.message)}`;
            })
            .join("\n");
    }
}
