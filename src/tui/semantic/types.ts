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

export type SemanticColor = keyof ThemeConfig["colors"];

export interface ThemeConfig {
    colors: {
        background: string;
        panelBackground: string;

        text: string;
        mutedText: string;
        inverseText: string;

        border: string;
        focusBorder: string;

        primary: string;
        primaryText: string;

        success: string;
        warning: string;
        error: string;

        value: string;
        code: string;

        selectionBackground: string;
        selectionText: string;
    };
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

export interface SpacerProps {
    size: number;
    axis?: "horizontal" | "vertical";
}


export interface LabelProps {
    color?: SemanticColor;
    bold?: boolean;
    italic?: boolean;
    wrap?: boolean;
    children: ReactNode;
}

export interface ValueProps {
    color?: SemanticColor;
    truncate?: boolean;
    children: ReactNode;
}

export interface CodeProps {
    color?: SemanticColor;
    children: string;
}

export type CodeTokenType =
    | "punctuation"
    | "string"
    | "number"
    | "boolean"
    | "null"
    | "key"
    | "unknown";

export interface CodeToken {
    type: CodeTokenType;
    value: string;
}

export interface CodeHighlightProps {
    tokens: CodeToken[];
}

export interface FieldProps {
    label: string;
    value: ReactNode;
    selected?: boolean;
    onActivate?: () => void;
}

export interface TextInputProps {
    value: string;
    placeholder?: string;
    focused?: boolean;
    onChange: (value: string) => void;
    onSubmit?: () => void;
}

export interface SelectOption<TValue extends string = string> {
    label: string;
    value: TValue;
}

export interface SelectProps<TValue extends string = string> {
    options: SelectOption<TValue>[];
    value: TValue;
    focused?: boolean;
    onChange: (value: TValue) => void;
    onSubmit?: () => void;
}

export interface ButtonProps {
    label: string;
    selected?: boolean;
    onActivate?: () => void;
}

export interface MenuButtonProps {
    label: string;
    selected?: boolean;
    onActivate?: () => void;
}

export interface MenuItemProps {
    label: string;
    description?: string;
    suffix?: string;
    selected?: boolean;
    onActivate?: () => void;
}