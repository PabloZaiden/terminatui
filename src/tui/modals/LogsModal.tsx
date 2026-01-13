import { LogsModal as LogsModalComponent } from "../components/LogsModal.tsx";
import { ModalBase } from "./ModalBase.ts";
import type { ModalComponent } from "../registry.tsx";

export interface LogsModalParams {}

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
        return function LogsModalComponentWrapper({ params: _params, onClose }: { params: LogsModalParams; onClose: () => void; }) {
            return (
                <LogsModalComponent
                    visible={true}
                    onClose={onClose}
                />
            );
        };
    }
}
