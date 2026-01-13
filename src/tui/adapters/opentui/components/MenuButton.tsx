import type { MenuButtonProps } from "../../../semantic/types.ts";
import { Theme } from "../../../theme.ts";

export function MenuButton({ label, selected, onActivate }: MenuButtonProps) {
    const prefix = selected ? "► " : "  ";
    const displayLabel = `[ ${label} ]`;

    const fg = selected ? Theme.colors.selectionText : Theme.actionButton;
    const bg = selected ? Theme.colors.selectionBackground : undefined;

    return (
        <box marginTop={1}>
            <text fg={fg} bg={bg} {...({ onClick: onActivate } as any)}>
                {prefix}{displayLabel}
            </text>
        </box>
    );
}
