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
}

export interface Renderer {
    initialize: () => Promise<void>;
    render: (node: ReactNode) => void;
    destroy: () => void;

    keyboard: KeyboardAdapter;
    components: RendererComponents;
}
