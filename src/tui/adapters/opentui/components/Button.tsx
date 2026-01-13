import type { ButtonProps } from "../../../semantic/types.ts";
import { Theme } from "../../../theme.ts";

export function Button({ label, selected, onActivate }: ButtonProps) {
    const fg = selected ? Theme.colors.selectionText : Theme.colors.text;
    const bg = selected ? Theme.colors.selectionBackground : undefined;

    return (
        <text fg={fg} bg={bg} {...({ onClick: onActivate } as any)}>
            {label}
        </text>
    );
}
