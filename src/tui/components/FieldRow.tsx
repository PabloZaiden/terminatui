import type { FieldProps } from "../semantic/types.ts";
import { Theme } from "../theme.ts";

export interface FieldRowProps {
    /** Field label */
    label: string;
    /** Field value to display */
    value: string;
    /** Whether this row is selected */
    isSelected: boolean;
}

/**
 * @deprecated Use semantic `Field` via renderer adapter.
 */
export function FieldRow({ label, value, isSelected }: FieldRowProps) {
    return (
        <Field
            label={label}
            value={value}
            selected={isSelected}
        />
    );
}

export function Field({ label, value, selected, onActivate }: FieldProps) {
    const prefix = selected ? "► " : "  ";
    const labelColor = selected ? Theme.borderFocused : Theme.label;
    const valueColor = selected ? Theme.value : Theme.statusText;

    return (
        <box flexDirection="row" gap={1} {...({ onClick: onActivate } as any)}>
            <text fg={labelColor}>
                {prefix}{label}:
            </text>
            <text fg={valueColor}>{value}</text>
        </box>
    );
}
