import { useEffect } from "react";
import { Box } from "ink";
import type { ScrollViewProps, ScrollViewRef } from "../../../semantic/layoutTypes.ts";

/**
 * Ink ScrollView - a simple container that provides scroll-like semantics.
 * 
 * Note: Ink doesn't have native scroll container support like OpenTUI.
 * This component provides the ScrollViewRef interface but scrolling is a no-op.
 * Content will naturally flow/wrap in the terminal.
 */
export function ScrollView({ 
    children, 
    scrollRef,
    flex,
    width,
    height,
    flexDirection = "column",
    alignItems,
    justifyContent,
    gap,
}: ScrollViewProps) {
    // Provide a dummy imperative API for compatibility
    useEffect(() => {
        if (scrollRef) {
            const noOpRef: ScrollViewRef = {
                scrollToTop: () => {},
                scrollToBottom: () => {},
                scrollToIndex: () => {},
            };
            scrollRef(noOpRef);
        }
    }, [scrollRef]);

    return (
        <Box
            flexGrow={flex}
            width={width as any}
            height={height as any}
            flexDirection={flexDirection}
            alignItems={alignItems}
            justifyContent={justifyContent}
            gap={gap}
        >
            {children}
        </Box>
    );
}
