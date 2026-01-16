import type { LogEvent } from "../../core/logger.ts";
import type { NavigationAPI } from "../context/NavigationContext.tsx";

import { RenderLogsScreen } from "../semantic/render.tsx";

export class LogsController {
    #navigation: NavigationAPI;

    public constructor({ navigation }: { navigation: NavigationAPI }) {
        this.#navigation = navigation;
    }

    public getCopyPayload(logs: LogEvent[]): { label: string; content: string } | null {
        const topModal = this.#navigation.modalStack[this.#navigation.modalStack.length - 1];
        if (topModal?.id !== "logs") {
            return null;
        }

        const tail = logs.slice(-200);
        const text = tail
            .map((l) => {
                const t = l.timestamp.toISOString();
                return `[${t}] ${String(l.level).toUpperCase()}: ${String(l.message)}`;
            })
            .join("\n");

        return { label: "Logs", content: text };
    }

    public render(logs: LogEvent[]): React.ReactNode {
        return (
            <RenderLogsScreen
                key="modal-logs"
                items={logs.map((l) => ({
                    level: String(l.level),
                    message: String(l.message),
                    timestamp: l.timestamp.getTime(),
                }))}
                onClose={() => this.#navigation.closeModal()}
            />
        );
    }
}
