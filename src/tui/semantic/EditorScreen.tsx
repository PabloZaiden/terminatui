export interface EditorScreenProps {
    fieldId: string;
    label: string;
    valueString: string;

    editorType: "text" | "number" | "select";

    selectOptions?: { label: string; value: string }[];
    selectIndex?: number;

    cliArguments?: {
        command: string;
        onActivate: () => void;
    };

    onChangeText?: (text: string) => void;
    onChangeSelectIndex?: (index: number) => void;
    onSubmit?: () => void;
    onCancel: () => void;
}

export function EditorScreen(_props: EditorScreenProps) {
    // Semantic-only marker component. Adapter renders this.
    return null;
}
