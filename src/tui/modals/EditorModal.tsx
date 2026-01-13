import { EditorModal as EditorModalComponent } from "../components/EditorModal.tsx";
import type { FieldConfig } from "../components/types.ts";
import type { ModalComponent } from "../registry.tsx";
import { ModalBase } from "./ModalBase.ts";

interface EditorModalParams {
    fieldKey: string;
    currentValue: unknown;
    fieldConfigs: FieldConfig[];
    onSubmit: (value: unknown) => void;
    onCancel: () => void;
}

/**
 * Property editor modal wrapper for registry.
 */
export class EditorModal extends ModalBase<EditorModalParams> {
    getId(): string {
        return "property-editor";
    }

    override component(): ModalComponent<EditorModalParams> {
        return function EditorModalComponentWrapper({ params, onClose }: { params: EditorModalParams; onClose: () => void; }) {
            return (
                <EditorModalComponent
                    fieldKey={params.fieldKey}
                    currentValue={params.currentValue}
                    visible={true}
                    onSubmit={(value) => {
                        params.onSubmit?.(value);
                    }}
                    onCancel={() => {
                        params.onCancel?.();
                        onClose();
                    }}
                    fieldConfigs={params.fieldConfigs}
                />
            );
        };
    }
}
