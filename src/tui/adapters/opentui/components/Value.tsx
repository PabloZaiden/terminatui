import type { ReactNode } from "react";
import type { ValueProps } from "../../../semantic/types.ts";
import { SemanticColors } from "../../../theme.ts";

export function Value({ color = "value", truncate, children }: ValueProps & { children: ReactNode }) {
    const fg = SemanticColors[color] ?? SemanticColors.value;

    return (
        <text fg={fg} {...({ truncate } as any)}>
            {children}
        </text>
    );
}
