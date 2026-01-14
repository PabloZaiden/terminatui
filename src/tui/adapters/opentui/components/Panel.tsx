import type { ReactNode } from "react";
import type { PanelProps, Spacing } from "../../../semantic/types.ts";
import { Theme } from "../../../theme.ts";

function normalizePadding(
    padding: number | Spacing | undefined,
    opts: { dense: boolean }
): { padding?: number; paddingTop?: number; paddingRight?: number; paddingBottom?: number; paddingLeft?: number } {
    if (padding === undefined) {
        return opts.dense
            ? {
                  padding: 0,
                  paddingLeft: 1,
                  paddingRight: 1,
              }
            : { padding: 1 };
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

export function Panel({
    title,
    focused,
    border = true,
    surface = "panel",
    dense = false,
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
}: PanelProps & { children?: ReactNode }) {
    const backgroundColor = surface === "overlay" ? Theme.overlay : Theme.colors.panelBackground;

    // Match the old modal implementation:
    // - modal borders were always `Theme.overlayTitle`
    // - typical panels use focused/unfocused border colors
    const borderColor = surface === "overlay" ? Theme.overlayTitle : focused ? Theme.borderFocused : Theme.border;

    const resolvedTitleInset = 0;

    const resolvedPadding = normalizePadding(padding, { dense });

    return (
        <box
            border={border}
            borderStyle={border ? "rounded" : undefined}
            borderColor={borderColor}
            title={title}
            padding={resolvedPadding.padding}
            paddingTop={resolvedPadding.paddingTop}
            paddingRight={resolvedPadding.paddingRight}
            paddingBottom={resolvedPadding.paddingBottom}
            paddingLeft={resolvedPadding.paddingLeft}
            flexGrow={flex}
            flexShrink={noShrink ? 0 : flex === undefined ? undefined : 1}
            width={width as any}
            height={height as any}
            flexDirection={flexDirection as any}
            alignItems={alignItems as any}
            justifyContent={justifyContent as any}
            gap={gap}
            backgroundColor={backgroundColor}
        >
            {resolvedTitleInset > 0 ? <box height={resolvedTitleInset} /> : null}
            {children}
        </box>
    );
}
