import { Theme } from "../theme.ts";
import { ModalBase } from "./ModalBase.tsx";

interface CliModalProps {
    /** CLI command to display */
    command: string;
    /** Whether the modal is visible */
    visible: boolean;
    /** Called when the modal should close */
    onClose?: () => void;
}

/**
 * Modal displaying the CLI command equivalent of the current config.
 */
export function CliModal({
    command,
    visible,
    onClose: _onClose,
}: CliModalProps) {
    if (!visible) {
        return null;
    }

    return (
        <ModalBase title="CLI Command" width="80%" height={10} top={4} left={4}>
            <scrollbox scrollX={true} height={3}>
                <text fg={Theme.value}>
                    {command}
                </text>
            </scrollbox>

            <text fg={Theme.statusText}>
                Enter or Esc to close
            </text>
        </ModalBase>
    );
}
