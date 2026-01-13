import { LogsModal as LogsModalComponent } from "../components/LogsModal.tsx";
import type { LogEvent } from "../../core/logger.ts";
import { ModalBase } from "./ModalBase.ts";
import type { ModalComponent } from "../registry.tsx";

export interface LogsModalParams {
    logs: LogEvent[];
}

/**
 * Logs modal wrapper for registry.
 * Displays application log history with color-coded levels.
 */
export class LogsModal extends ModalBase<LogsModalParams> {
    static readonly Id = "logs";
    
    getId(): string {
        return LogsModal.Id;
    }

    override component(): ModalComponent<LogsModalParams> {
        return function LogsModalComponentWrapper({ params, onClose }: { params: LogsModalParams; onClose: () => void; }) {
            return (
                <LogsModalComponent
                    logs={params.logs}
                    visible={true}
                    onClose={onClose}
                />
            );
        };
    }
}
