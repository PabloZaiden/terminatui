import type { MenuItemProps } from "../../../semantic/types.ts";
import { Theme } from "../../../theme.ts";

export function MenuItem({
    label,
    description,
    suffix,
    selected,
    onActivate,
}: MenuItemProps) {
    const prefix = selected ? "► " : "  ";
    const displayLabel = suffix ? `${label} ${suffix}` : label;

    const fg = selected ? Theme.colors.selectionText : Theme.colors.text;
    const bg = selected ? Theme.colors.selectionBackground : undefined;

    return (
        <box flexDirection="column">
            <text fg={fg} bg={bg} {...({ onClick: onActivate } as any)}>
                {prefix}{displayLabel}
            </text>
            {description ? (
                <text fg={selected ? Theme.colors.text : Theme.colors.mutedText}>
                    {"    "}{description}
                </text>
            ) : null}
        </box>
    );
}
