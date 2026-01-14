import { createCliRenderer, type CliRenderer } from "@opentui/core";
import { createRoot, type Root } from "@opentui/react";
import { useLayoutEffect, type ReactNode } from "react";
import { SemanticColors } from "../../theme.ts";
import type { Renderer, RendererConfig } from "../types.ts";
import { useOpenTuiKeyboardAdapter } from "./keyboard.ts";
import { Button } from "./components/Button.tsx";
import { Code } from "./components/Code.tsx";
import { CodeHighlight } from "./components/CodeHighlight.tsx";
import { Container } from "./components/Container.tsx";
import { Field } from "./components/Field.tsx";
import { Label } from "./components/Label.tsx";
import { MenuButton } from "./components/MenuButton.tsx";
import { MenuItem } from "./components/MenuItem.tsx";
import { Overlay } from "./components/Overlay.tsx";
import { Spacer } from "./components/Spacer.tsx";
import { Panel } from "./components/Panel.tsx";
import { ScrollView as OpenTuiScrollView } from "./components/ScrollView.tsx";
import { Select } from "./components/Select.tsx";
import { TextInput } from "./components/TextInput.tsx";
import { Value } from "./components/Value.tsx";

export class OpenTuiRenderer implements Renderer {
    private renderer: CliRenderer | null = null;
    private root: Root | null = null;

    private activeKeyboardAdapter: Renderer["keyboard"] | null = null;

    public keyboard: Renderer["keyboard"] = {
        setActiveHandler: (id, handler) => {
            return this.activeKeyboardAdapter?.setActiveHandler(id, handler) ?? (() => {});
        },
        setGlobalHandler: (handler) => {
            return this.activeKeyboardAdapter?.setGlobalHandler(handler) ?? (() => {});
        },
    };

    public components: Renderer["components"] = {
        Field,
        Button,
        MenuButton,
        MenuItem,
        Container,
        Panel,
        ScrollView: OpenTuiScrollView,

        Overlay,
        Spacer,
        Label,
        Value,
        Code,
        CodeHighlight,

        Select,
        TextInput,
    };

    constructor(private readonly config: RendererConfig) {}

    async initialize(): Promise<void> {
        this.renderer = await createCliRenderer({
            useAlternateScreen: this.config.useAlternateScreen ?? true,
            useConsole: false,
            exitOnCtrlC: true,
            backgroundColor: SemanticColors.background,
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
                    this.activeKeyboardAdapter = keyboard;
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

    useLayoutEffect(() => {
        onReady(keyboard);
    }, [onReady, keyboard]);

    return <>{children}</>;
}
