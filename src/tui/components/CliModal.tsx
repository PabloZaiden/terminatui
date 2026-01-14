import { useActiveKeyHandler } from "../hooks/useActiveKeyHandler.ts";
import { Container } from "../semantic/Container.tsx";
import { ScrollView } from "../semantic/ScrollView.tsx";
import { ModalBase } from "./ModalBase.tsx";
import { useClipboardProvider } from "../hooks/useClipboardProvider.ts";
import { Label } from "../semantic/Label.tsx";
import { Value } from "../semantic/Value.tsx";

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
            <ScrollView axis="horizontal" height={3}>
                <Container>
                    <Value>{command}</Value>
                </Container>
            </ScrollView>

            <Label color="mutedText">Enter or Esc to close</Label>
        </ModalBase>
    );
}
