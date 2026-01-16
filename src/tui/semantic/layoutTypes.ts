import type { ReactNode } from "react";

export type Align = "flex-start" | "center" | "flex-end" | "stretch";
export type Justify = "flex-start" | "center" | "flex-end" | "space-between" | "space-around" | "space-evenly";
export type FlexDirection = "row" | "column";

export interface Spacing {
    top?: number;
    right?: number;
    bottom?: number;
    left?: number;
}

export interface LayoutProps {
    flex?: number;
    width?: number | string;
    height?: number | string;

    flexDirection?: FlexDirection;
    alignItems?: Align;
    justifyContent?: Justify;

    gap?: number;
    padding?: number | Spacing;

    /** When set, should prevent the node from shrinking in flex layouts. */
    noShrink?: boolean;
}

export type PanelSurface = "panel" | "overlay";

export interface PanelProps extends LayoutProps {
    title?: string;
    focused?: boolean;
    border?: boolean;
    surface?: PanelSurface;

    /** Renderer-level compact styling (e.g. no default padding). */
    dense?: boolean;

    children?: ReactNode;
}

export interface ContainerProps extends LayoutProps {
    children?: ReactNode;
}

export interface ScrollViewRef {
    scrollToTop: () => void;
    scrollToBottom: () => void;
    scrollToIndex: (index: number) => void;
}

export interface ScrollViewProps extends LayoutProps {
    axis?: "vertical" | "horizontal" | "both";
    stickyToEnd?: boolean;
    focused?: boolean;
    scrollRef?: (ref: ScrollViewRef | null) => void;
    children?: ReactNode;
}

export interface OverlayProps {
    zIndex?: number;
    top?: number | string;
    left?: number | string;
    right?: number | string;
    bottom?: number | string;
    width?: number | string;
    height?: number | string;
    children?: ReactNode;
}
