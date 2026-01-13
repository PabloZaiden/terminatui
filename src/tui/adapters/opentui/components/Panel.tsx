import type { ReactNode } from "react";
import type { PanelProps, Spacing } from "../../../semantic/types.ts";
import { Theme } from "../../../theme.ts";

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

export function Panel({
    title,
    focused,
    border = true,
    children,
    flex,
    width,
    height,
    flexDirection,
    alignItems,
    justifyContent,
    gap,
    padding,
}: PanelProps & { children?: ReactNode }) {
    return (
        <box
            border={border}
            borderStyle={border ? "rounded" : undefined}
            borderColor={focused ? Theme.borderFocused : Theme.border}
            title={title}
            padding={normalizePadding(padding)}
            flexGrow={flex}
            width={width as any}
            height={height as any}
            flexDirection={flexDirection as any}
            alignItems={alignItems as any}
            justifyContent={justifyContent as any}
            gap={gap}
            backgroundColor={Theme.colors.panelBackground}
        >
            {children}
        </box>
    );
}
