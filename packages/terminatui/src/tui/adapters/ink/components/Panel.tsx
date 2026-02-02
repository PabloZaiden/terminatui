import { Box, Text } from "ink";
import type { PanelProps } from "../../../semantic/layoutTypes.ts";

function normalizePadding(padding: PanelProps["padding"], opts: { dense: boolean }): { padding?: number } {
    if (typeof padding === "number") {
        return { padding };
    }

    if (padding && typeof padding === "object") {
        const top = padding.top ?? 0;
        const right = padding.right ?? 0;
        const bottom = padding.bottom ?? 0;
        const left = padding.left ?? 0;
        const fallback = opts.dense ? 0 : 1;

        const pad = top === right && right === bottom && bottom === left ? top : fallback;
        return { padding: pad };
    }

    return { padding: opts.dense ? 0 : 1 };
}

export function Panel({ title, children, padding, dense = false, flexDirection = "column" }: PanelProps) {
    const resolvedPadding = normalizePadding(padding, { dense });

    return (
        <Box flexDirection={flexDirection} padding={resolvedPadding.padding}>
            {title ? (
                <Text bold>
                    {title}
                </Text>
            ) : null}
            {children}
        </Box>
    );
}
