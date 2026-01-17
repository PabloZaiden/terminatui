import type { FieldConfig } from "./types.ts";

export interface ConfigScreenProps {
    title: string;

    commandId: string[];
    fieldConfigs: FieldConfig[];
    values: Record<string, unknown>;

    /** CLI command string for display and copy */
    cliCommand: string;

    selectedFieldIndex: number;
    onSelectionChange: (index: number) => void;

    onEditField: (fieldId: string) => void;
    onRun: () => void;
}

export function ConfigScreen(_props: ConfigScreenProps) {
    // Semantic-only marker component. Adapter renders this.
    return null;
}
