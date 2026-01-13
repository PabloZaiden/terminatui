import { LogsModal as LogsModalComponent } from "../components/LogsModal.tsx";
import { registerModal } from "../registry.tsx";
import type { LogEvent } from "../../core/logger.ts";

interface LogsModalParams {
    logs: LogEvent[];
}

/**
 * Logs modal wrapper for registry.
 * Displays application log history with color-coded levels.
 */
function LogsModal({ params, onClose }: { params: LogsModalParams; onClose: () => void }) {
    return (
        <LogsModalComponent
            logs={params.logs}
            visible={true}
            onClose={onClose}
        />
    );
}

// Self-register this modal
registerModal("logs", LogsModal);

export { LogsModal };
