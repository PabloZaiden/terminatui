import type { MenuItemProps } from "../../../semantic/types.ts";
import { SemanticColors } from "../../../theme.ts";

export function MenuItem({
    label,
    description,
    suffix,
    selected,
    onActivate,
}: MenuItemProps) {
    const prefix = selected ? "► " : "  ";
    const displayLabel = suffix ? `${label} ${suffix}` : label;

    const fg = selected ? SemanticColors.selectionText : SemanticColors.text;
    const bg = selected ? SemanticColors.selectionBackground : undefined;

    return (
        <box flexDirection="column">
            <text fg={fg} bg={bg} {...({ onClick: onActivate })}>
                {prefix}{displayLabel}
            </text>
            {description ? (
                <text fg={selected ? SemanticColors.text : SemanticColors.mutedText}>
                    {"    "}{description}
                </text>
            ) : null}
        </box>
    );
}
