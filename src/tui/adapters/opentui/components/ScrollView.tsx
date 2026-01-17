import { useRef, type ReactNode } from "react";
import type { ScrollBoxRenderable } from "@opentui/core";
import type { ScrollViewProps, ScrollViewRef, Spacing } from "../../../semantic/layoutTypes.ts";

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

export function ScrollView({
    axis = "vertical",
    stickyToEnd,
    focused,
    scrollRef: onScrollRef,
    children,
    flex,
    width,
    height,
    flexDirection,
    alignItems,
    justifyContent,
    gap,
    padding,
}: ScrollViewProps & { children?: ReactNode }) {
        const scrollRef = useRef<ScrollBoxRenderable>(null);

        const imperativeApi: ScrollViewRef = {
            scrollToIndex: (index: number) => {
                scrollRef.current?.scrollTo(index);
            },
        };

        // Provide the imperative API via callback.
        if (onScrollRef) {
            onScrollRef(imperativeApi);
        }

    const scrollY = axis === "vertical" || axis === "both";
    const scrollX = axis === "horizontal" || axis === "both";

    const resolvedStickyToEnd = stickyToEnd ? true : undefined;


        return (
            <scrollbox
                ref={scrollRef}
                scrollY={scrollY}
                scrollX={scrollX}
                focused={focused}
                {...({ stickyToEnd: resolvedStickyToEnd })}
                flexGrow={flex}
                width={width as any}
                height={height as any}
            >
                <box
                    flexDirection={flexDirection as any}
                    alignItems={alignItems as any}
                    justifyContent={justifyContent as any}
                    gap={gap}
                    padding={normalizePadding(padding)}
                >
                    {children}
                </box>
            </scrollbox>
        );
}
