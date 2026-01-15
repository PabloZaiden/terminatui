import type { ButtonProps } from "../../../semantic/types.ts";
import { SemanticColors } from "../../../theme.ts";

export function Button({ label, selected, onActivate }: ButtonProps) {
    const fg = selected ? SemanticColors.selectionText : SemanticColors.text;
    const bg = selected ? SemanticColors.selectionBackground : undefined;

    return (
        <text fg={fg} bg={bg} {...({ onClick: onActivate })}>
            {label}
        </text>
    );
}
