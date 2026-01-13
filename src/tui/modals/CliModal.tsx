import { CliModal as CliModalComponent } from "../components/CliModal.tsx";
import { registerModal } from "../registry.tsx";

interface CliModalParams {
    command: string;
}

/**
 * CLI command modal wrapper for registry.
 * Shows the CLI equivalent of the current command configuration.
 */
function CliModal({ params, onClose }: { params: CliModalParams; onClose: () => void }) {
    return (
        <CliModalComponent
            command={params.command}
            visible={true}
            onClose={onClose}
        />
    );
}

// Self-register this modal
registerModal("cli", CliModal);

export { CliModal };
