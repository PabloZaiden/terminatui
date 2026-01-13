import type { FieldProps } from "../../../semantic/types.ts";
import { Theme } from "../../../theme.ts";

export function Field({ label, value, selected, onActivate }: FieldProps) {
    const prefix = selected ? "► " : "  ";
    const labelColor = selected ? Theme.borderFocused : Theme.label;
    const valueColor = selected ? Theme.value : Theme.statusText;

    return (
        <box flexDirection="row" gap={1} {...({ onClick: onActivate } as any)}>
            <text fg={labelColor}>
                {prefix}
                {label}:
            </text>
            <text fg={valueColor}>{value}</text>
        </box>
    );
}
