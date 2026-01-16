import type { ReactNode } from "react";
import type { PanelProps, Spacing } from "../../../semantic/layoutTypes.ts";
import { SemanticColors } from "../../../theme.ts";

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
    const backgroundColor = surface === "overlay" ? SemanticColors.overlay : SemanticColors.panelBackground;

    const borderColor = surface === "overlay" ? SemanticColors.warning : focused ? SemanticColors.focusBorder : SemanticColors.border;

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
            {children}
        </box>
    );
}
