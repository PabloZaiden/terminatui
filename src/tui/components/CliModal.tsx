import { Theme } from "../theme.ts";
import { useActiveKeyHandler } from "../hooks/useActiveKeyHandler.ts";
import { ModalBase } from "./ModalBase.tsx";
import { useClipboardProvider } from "../hooks/useClipboardProvider.ts";

export interface CliModalParams {
    command: string;
}

interface CliModalProps {
    /** CLI command to display */
    command: string;
    /** Whether the modal is visible */
    visible: boolean;
    /** Called when the modal should close */
    onClose: () => void;
}

/**
 * Modal displaying the CLI command equivalent of the current config.
 */
export function CliModal({
    command,
    visible,
    onClose,
}: CliModalProps) {
    // Register clipboard provider for CLI command
    useClipboardProvider(
        () => ({ content: command, label: "CLI" }),
        visible
    );

    // Handle Enter to close (Esc is handled globally)
    useActiveKeyHandler(
        (event) => {
            if (event.name === "return" || event.name === "enter") {
                onClose();
                return true;
            }
            return false;
        },
        { enabled: visible }
    );

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
