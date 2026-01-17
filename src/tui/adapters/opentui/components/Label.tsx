import type { ReactNode } from "react";
import type { LabelProps } from "../../../semantic/types.ts";
import { SemanticColors } from "../../../theme.ts";

export function Label({ color = "text", bold, italic, children }: LabelProps & { children: ReactNode }) {
    const fg = SemanticColors[color] ?? SemanticColors.text;

    const content = bold ? <strong>{children}</strong> : children;

    return (
        <text fg={fg}>
            {italic ? <em>{content}</em> : content}
        </text>
    );
}
