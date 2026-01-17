import type { ReactNode } from "react";
import type { AppShellProps } from "../semantic/AppShell.tsx";
import type { CommandBrowserScreenProps } from "../semantic/CommandBrowserScreen.tsx";
import type { ConfigScreenProps } from "../semantic/ConfigScreen.tsx";
import type { RunningScreenProps } from "../semantic/RunningScreen.tsx";
import type { LogsScreenProps } from "../semantic/LogsScreen.tsx";
import type { EditorScreenProps } from "../semantic/EditorScreen.tsx";
import type { TuiAction } from "../actions.ts";

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

    renderSemanticAppShell: (props: AppShellProps) => ReactNode;
    renderSemanticCommandBrowserScreen: (props: CommandBrowserScreenProps) => ReactNode;
    renderSemanticConfigScreen: (props: ConfigScreenProps) => ReactNode;
    renderSemanticRunningScreen: (props: RunningScreenProps) => ReactNode;
    renderSemanticLogsScreen: (props: LogsScreenProps) => ReactNode;
    renderSemanticEditorScreen: (props: EditorScreenProps) => ReactNode;

    /** 
     * Renders an invisible component that handles global keyboard bindings.
     * This component can use hooks and will dispatch actions via the provided dispatcher.
     */
    renderKeyboardHandler?: (props: {
        dispatchAction: (action: TuiAction) => void;
        getScreenKeyHandler: () => ((event: KeyboardEvent) => boolean) | null;
        onCopyToastChange?: (toast: string | null) => void;
    }) => ReactNode;

}
