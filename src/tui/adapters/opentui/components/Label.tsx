import type { ReactNode } from "react";
import type { LabelProps } from "../../../semantic/types.ts";
import { Theme } from "../../../theme.ts";

export function Label({ color = "text", bold, italic, wrap, children }: LabelProps & { children: ReactNode }) {
    const fg = Theme.colors[color] ?? Theme.colors.text;

    const content = bold ? <strong>{children}</strong> : children;

    return (
        <text fg={fg} {...({ wrap } as any)}>
            {italic ? <em>{content}</em> : content}
        </text>
    );
}
