import { EditorModal as EditorModalComponent } from "../components/EditorModal.tsx";
import { registerModal } from "../registry.tsx";
import type { FieldConfig } from "../components/types.ts";

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
function EditorModal({ params, onClose }: { params: EditorModalParams; onClose: () => void }) {
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
}

// Self-register this modal
registerModal("property-editor", EditorModal);

export { EditorModal };
