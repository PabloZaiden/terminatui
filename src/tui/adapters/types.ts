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

export interface Renderer {
    initialize: () => Promise<void>;
    render: (node: ReactNode) => void;
    destroy: () => void;

    keyboard: KeyboardAdapter;
}
