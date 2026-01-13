import type { CodeProps } from "../../../semantic/types.ts";
import { Theme } from "../../../theme.ts";

export function Code({ color = "code", children }: CodeProps) {
    const fg = Theme.colors[color] ?? Theme.colors.code;

    return (
        <text fg={fg}>
            {children}
        </text>
    );
}
