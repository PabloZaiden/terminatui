import { EditorModal as EditorModalComponent } from "../components/EditorModal.tsx";
import type { FieldConfig } from "../components/types.ts";
import type { ModalComponent } from "../registry.tsx";
import { ModalBase } from "./ModalBase.ts";

export interface EditorModalParams {
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
    static readonly Id = "property-editor";

    getId(): string {
        return EditorModal.Id;
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
