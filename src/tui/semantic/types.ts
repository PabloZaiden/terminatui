import type { ReactNode } from "react";

export * from "./layoutTypes.ts";

export interface ThemeConfig {
    colors: {
        background: string;
        panelBackground: string;
        overlay: string;

        text: string;
        mutedText: string;
        inverseText: string;

        border: string;
        focusBorder: string;

        primary: string;
        primaryText: string;

        success: string;
        warning: string;
        error: string;

        value: string;
        code: string;

        selectionBackground: string;
        selectionText: string;
    };
}

export type SemanticColor = keyof ThemeConfig["colors"];

export type CodeTokenType =
    | "punctuation"
    | "string"
    | "number"
    | "boolean"
    | "null"
    | "key"
    | "unknown";

export interface CodeToken {
    type: CodeTokenType;
    value: string;
}

export interface CodeHighlightProps {
    tokens: CodeToken[];
}

export interface LabelProps {
    color?: SemanticColor;
    bold?: boolean;
    italic?: boolean;
    children: ReactNode;
}

export interface FieldProps {
    label: string;
    value: ReactNode;
    selected?: boolean;
    onActivate?: () => void;
}

export interface TextInputProps {
    value: string;
    placeholder?: string;
    focused?: boolean;
    onChange: (value: string) => void;
    onSubmit?: () => void;
}

export interface SelectOption {
    label: string;
    value: string;
}

export interface SelectProps {
    options: SelectOption[];
    value: string;
    focused?: boolean;
    onChange: (value: string) => void;
    onSubmit?: () => void;
}

export interface ButtonProps {
    label: string;
    selected?: boolean;
    onActivate?: () => void;
}

export interface MenuButtonProps {
    label: string;
    selected?: boolean;
    onActivate?: () => void;
}

export interface MenuItemProps {
    label: string;
    description?: string;
    suffix?: string;
    selected?: boolean;
    onActivate?: () => void;
}

export interface SpinnerProps {
    active: boolean;
}

// ─────────────────────────────────────────────────────────────────────────────
// FieldConfig types (used by ConfigScreen, schemaToFields, adapter ConfigForm)
// ─────────────────────────────────────────────────────────────────────────────

export type FieldType = "text" | "number" | "boolean" | "enum";

export interface FieldOption {
    name: string;
    value: unknown;
}

export interface FieldConfig {
    key: string;
    label: string;
    type: FieldType;
    options?: FieldOption[];
}
