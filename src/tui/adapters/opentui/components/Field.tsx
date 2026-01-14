import type { FieldProps } from "../../../semantic/types.ts";
import { SemanticColors } from "../../../theme.ts";

export function Field({ label, value, selected, onActivate }: FieldProps) {
    const prefix = selected ? "► " : "  ";
    const labelColor = selected ? SemanticColors.focusBorder : SemanticColors.mutedText;
    const valueColor = selected ? SemanticColors.value : SemanticColors.text;

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
