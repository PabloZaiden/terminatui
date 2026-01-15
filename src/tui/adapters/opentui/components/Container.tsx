import type { ReactNode } from "react";
import type { ContainerProps, Spacing } from "../../../semantic/types.ts";

function normalizePadding(padding: number | Spacing | undefined):
    | { padding?: number; paddingTop?: number; paddingRight?: number; paddingBottom?: number; paddingLeft?: number }
    | undefined {
    if (padding === undefined) {
        return undefined;
    }

    if (typeof padding === "number") {
        return { padding };
    }

    return {
        paddingTop: padding.top ?? 0,
        paddingRight: padding.right ?? 0,
        paddingBottom: padding.bottom ?? 0,
        paddingLeft: padding.left ?? 0,
    };
}

export function Container({
    children,
    flex,
    width,
    height,
    flexDirection,
    alignItems,
    justifyContent,
    gap,
    padding,
    noShrink,
}: ContainerProps & { children?: ReactNode }) {
    const resolvedPadding = normalizePadding(padding);

    return (
        <box
            flexGrow={flex}
            flexShrink={noShrink ? 0 : flex === undefined ? undefined : 1}
            width={width as any}
            height={height as any}
            flexDirection={flexDirection as any}
            alignItems={alignItems as any}
            justifyContent={justifyContent as any}
            gap={gap}
            padding={resolvedPadding?.padding}
            paddingTop={resolvedPadding?.paddingTop}
            paddingRight={resolvedPadding?.paddingRight}
            paddingBottom={resolvedPadding?.paddingBottom}
            paddingLeft={resolvedPadding?.paddingLeft}
        >
            {children}
        </box>
    );
}
