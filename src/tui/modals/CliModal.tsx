import { CliModal as CliModalComponent } from "../components/CliModal.tsx";
import type { ModalComponent } from "../registry.tsx";
import { ModalBase } from "./ModalBase.ts";

export interface CliModalParams {
    command: string;
}

/**
 * CLI command modal wrapper for registry.
 * Shows the CLI equivalent of the current command configuration.
 */
export class CliModal extends ModalBase<CliModalParams> {
    static readonly Id = "cli";

    getId(): string {
        return CliModal.Id;
    }

    override component(): ModalComponent<CliModalParams> {
        return function CliModalComponentWrapper({ params, onClose }: { params: CliModalParams; onClose: () => void; }) {
            return (
                <CliModalComponent
                    command={params.command}
                    visible={true}
                    onClose={onClose}
                />
            );
        };
    }
}
