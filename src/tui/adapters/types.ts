import type { ReactNode } from "react";

export type RendererType = "opentui" | "ink";

export interface KeyboardEvent {
    name: string;
    sequence?: string;
    ctrl?: boolean;
    shift?: boolean;
    meta?: boolean;
}

export type KeyHandler = (event: KeyboardEvent) => boolean;

export interface KeyboardAdapter {
    setActiveHandler: (id: string, handler: KeyHandler) => () => void;
    setGlobalHandler: (handler: KeyHandler) => void;
}

export interface RendererConfig {
    useAlternateScreen?: boolean;
}

export interface RendererComponents {
    Field: (props: import("../semantic/types.ts").FieldProps) => ReactNode;
    Button: (props: import("../semantic/types.ts").ButtonProps) => ReactNode;
    MenuButton: (props: import("../semantic/types.ts").MenuButtonProps) => ReactNode;
    MenuItem: (props: import("../semantic/types.ts").MenuItemProps) => ReactNode;

    Container: (props: import("../semantic/types.ts").ContainerProps) => ReactNode;
    Panel: (props: import("../semantic/types.ts").PanelProps) => ReactNode;
    ScrollView: (props: import("../semantic/types.ts").ScrollViewProps) => ReactNode;

    Overlay: (props: import("../semantic/types.ts").OverlayProps) => ReactNode;

    Label: (props: import("../semantic/types.ts").LabelProps) => ReactNode;
    Value: (props: import("../semantic/types.ts").ValueProps) => ReactNode;
    Code: (props: import("../semantic/types.ts").CodeProps) => ReactNode;
    CodeHighlight: (props: import("../semantic/types.ts").CodeHighlightProps) => ReactNode;

    TextInput: (props: import("../semantic/types.ts").TextInputProps) => ReactNode;
    Select: (props: import("../semantic/types.ts").SelectProps) => ReactNode;
}

export interface Renderer {
    initialize: () => Promise<void>;
    render: (node: ReactNode) => void;
    destroy: () => void;

    keyboard: KeyboardAdapter;
    components: RendererComponents;
}
