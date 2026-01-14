import type { ReactNode } from "react";
import type { ContainerProps, Spacing } from "../../../semantic/types.ts";

function normalizePadding(padding: number | Spacing | undefined): any {
    if (padding === undefined) {
        return undefined;
    }

    if (typeof padding === "number") {
        return padding;
    }

    return {
        top: padding.top ?? 0,
        right: padding.right ?? 0,
        bottom: padding.bottom ?? 0,
        left: padding.left ?? 0,
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
}: ContainerProps & { children?: ReactNode }) {
    return (
        <box
            flexGrow={flex}
            flexShrink={flex === undefined ? undefined : 1}
            width={width as any}
            height={height as any}
            flexDirection={flexDirection as any}
            alignItems={alignItems as any}
            justifyContent={justifyContent as any}
            gap={gap}
            padding={normalizePadding(padding)}
        >
            {children}
        </box>
    );
}
