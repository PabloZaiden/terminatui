import { createCliRenderer, type CliRenderer } from "@opentui/core";
import { createRoot, type Root } from "@opentui/react";
import type { ReactNode } from "react";
import { Theme } from "../../theme.ts";
import type { Renderer, RendererConfig } from "../types.ts";
import { useOpenTuiKeyboardAdapter } from "./keyboard.ts";
import { Button } from "./components/Button.tsx";
import { Container } from "./components/Container.tsx";
import { Field } from "./components/Field.tsx";
import { MenuButton } from "./components/MenuButton.tsx";
import { MenuItem } from "./components/MenuItem.tsx";
import { Panel } from "./components/Panel.tsx";
import { ScrollView as OpenTuiScrollView } from "./components/ScrollView.tsx";

export class OpenTuiRenderer implements Renderer {
    private renderer: CliRenderer | null = null;
    private root: Root | null = null;

    public keyboard: Renderer["keyboard"] = {
        setActiveHandler: () => () => {},
        setGlobalHandler: () => {},
    };

    public components: Renderer["components"] = {
        Field,
        Button,
        MenuButton,
        MenuItem,
        Container,
        Panel,
        ScrollView: OpenTuiScrollView,
    };

    constructor(private readonly config: RendererConfig) {}

    async initialize(): Promise<void> {
        this.renderer = await createCliRenderer({
            useAlternateScreen: this.config.useAlternateScreen ?? true,
            useConsole: false,
            exitOnCtrlC: true,
            backgroundColor: Theme.background,
            useMouse: true,
            enableMouseMovement: true,
            openConsoleOnError: false,
        });

        this.root = createRoot(this.renderer);
    }

    render(node: ReactNode): void {
        if (!this.root) {
            throw new Error("OpenTuiRenderer not initialized");
        }

        this.root.render(
            <KeyboardBridge
                onReady={(keyboard) => {
                    this.keyboard = keyboard;
                }}
            >
                {node}
            </KeyboardBridge>
        );

        this.renderer?.start();
    }

    destroy(): void {
        this.renderer?.destroy();
        this.renderer = null;
        this.root = null;
    }
}

function KeyboardBridge({
    children,
    onReady,
}: {
    children: ReactNode;
    onReady: (keyboard: ReturnType<typeof useOpenTuiKeyboardAdapter>) => void;
}) {
    const keyboard = useOpenTuiKeyboardAdapter();
    onReady(keyboard);
    return <>{children}</>;
}
