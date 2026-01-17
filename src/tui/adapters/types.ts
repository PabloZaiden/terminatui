import type { ReactNode } from "react";

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
    setGlobalHandler: (handler: KeyHandler) => () => void;
}

export interface RendererConfig {
    useAlternateScreen?: boolean;
}

export interface Renderer {
    initialize: () => Promise<void>;
    render: (node: ReactNode) => void;
    destroy: () => void;
    supportCustomRendering: () => boolean;

    keyboard: KeyboardAdapter;

    renderSemanticAppShell: (props: import("../semantic/AppShell.tsx").AppShellProps) => ReactNode;
    renderSemanticCommandBrowserScreen: (
        props: import("../semantic/CommandBrowserScreen.tsx").CommandBrowserScreenProps
    ) => ReactNode;
    renderSemanticConfigScreen: (props: import("../semantic/ConfigScreen.tsx").ConfigScreenProps) => ReactNode;
    renderSemanticRunningScreen: (props: import("../semantic/RunningScreen.tsx").RunningScreenProps) => ReactNode;
    renderSemanticLogsScreen: (props: import("../semantic/LogsScreen.tsx").LogsScreenProps) => ReactNode;
    renderSemanticEditorScreen: (props: import("../semantic/EditorScreen.tsx").EditorScreenProps) => ReactNode;

    /** 
     * Renders an invisible component that handles global keyboard bindings.
     * This component can use hooks and will dispatch actions via the provided dispatcher.
     */
    renderKeyboardHandler?: (props: {
        dispatchAction: (action: import("../actions.ts").TuiAction) => void;
        getScreenKeyHandler: () => ((event: KeyboardEvent) => boolean) | null;
        onCopyToastChange?: (toast: string | null) => void;
    }) => ReactNode;

}
