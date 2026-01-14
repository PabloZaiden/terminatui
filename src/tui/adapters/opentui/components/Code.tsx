import type { CodeProps } from "../../../semantic/types.ts";
import { SemanticColors } from "../../../theme.ts";

export function Code({ color = "code", children }: CodeProps) {
    const fg = SemanticColors[color] ?? SemanticColors.code;

    return (
        <text fg={fg}>
            {children}
        </text>
    );
}
