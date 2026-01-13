import type { ReactNode } from "react";
import type { ValueProps } from "../../../semantic/types.ts";
import { Theme } from "../../../theme.ts";

export function Value({ color = "value", truncate, children }: ValueProps & { children: ReactNode }) {
    const fg = Theme.colors[color] ?? Theme.colors.value;

    return (
        <text fg={fg} {...({ truncate } as any)}>
            {children}
        </text>
    );
}
