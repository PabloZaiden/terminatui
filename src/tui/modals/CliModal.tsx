import { useActiveKeyHandler } from "../hooks/useActiveKeyHandler.ts";
import { Container } from "../semantic/Container.tsx";
import { ScrollView } from "../semantic/ScrollView.tsx";
import { ModalBase } from "../components/ModalBase.tsx";
import { useClipboardProvider } from "../hooks/useClipboardProvider.ts";
import { Label } from "../semantic/Label.tsx";
import { Value } from "../semantic/Value.tsx";
import type { ModalComponent, ModalDefinition } from "../registry.ts";

export interface CliModalParams {
    command: string;
}

export class CliModal implements ModalDefinition<CliModalParams> {
    static readonly Id = "cli";

    getId(): string {
        return CliModal.Id;
    }

    component(): ModalComponent<CliModalParams> {
        return function CliModalComponentWrapper({ params, onClose }: { params: CliModalParams; onClose: () => void; }) {
            return (
                <CliModalView
                    command={params.command}
                    visible={true}
                    onClose={onClose}
                />
            );
        };
    }
}

interface CliModalViewProps extends CliModalParams {
    /** Whether the modal is visible */
    visible: boolean;
    /** Called when the modal should close */
    onClose: () => void;
}

/**
 * Modal displaying the CLI command equivalent of the current config.
 */
function CliModalView({
    command,
    visible,
    onClose,
}: CliModalViewProps) {
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
