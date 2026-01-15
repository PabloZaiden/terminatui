import { render } from "ink";
import type { ReactNode } from "react";
import { useLayoutEffect } from "react";

import type { Renderer, RendererConfig } from "../types.ts";
import { useInkKeyboardAdapter } from "./keyboard.ts";

import { Button } from "./components/Button.tsx";
import { Container } from "./components/Container.tsx";
import { Field } from "./components/Field.tsx";
import { Label } from "./components/Label.tsx";
import { MenuButton } from "./components/MenuButton.tsx";
import { MenuItem } from "./components/MenuItem.tsx";
import { Overlay } from "./components/Overlay.tsx";
import { Panel } from "./components/Panel.tsx";
import { ScrollView } from "./components/ScrollView.tsx";
import { Select } from "./components/Select.tsx";
import { Spacer } from "./components/Spacer.tsx";
import { TextInput } from "./components/TextInput.tsx";
import { Value } from "./components/Value.tsx";
import { Code } from "./components/Code.tsx";
import { CodeHighlight } from "./components/CodeHighlight.tsx";

export class InkRenderer implements Renderer {
    private instance: ReturnType<typeof render> | null = null;
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
        ScrollView,

        Overlay,
        Spacer,

        Label,
        Value,
        Code,
        CodeHighlight,

        Select,
        TextInput,
    };

    constructor(_config: RendererConfig) {}

    async initialize(): Promise<void> {
        return;
    }

    render(node: ReactNode): void {
        if (process.stdin.isTTY) {
            try {
                process.stdin.setRawMode(true);
            } catch {
                // Ignore.
            }
            if (process.stdin.isPaused()) {
                process.stdin.resume();
            }
        }

        if (this.instance) {
            this.instance.rerender(
                <KeyboardBridge
                    node={node}
                    onReady={(keyboard) => {
                        this.activeKeyboardAdapter = keyboard;
                    }}
                />
            );
            return;
        }

        this.instance = render(
            <KeyboardBridge
                node={node}
                onReady={(keyboard) => {
                    this.activeKeyboardAdapter = keyboard;
                }}
            />,
            {
                exitOnCtrlC: true,
                patchConsole: false,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                stdout: process.stdout as any,
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                stdin: process.stdin as any,
            }
        );
    }

    destroy(): void {
        this.instance?.unmount();
        this.instance = null;

        if (process.stdin.isTTY) {
            try {
                process.stdin.setRawMode(false);
            } catch {
                // Ignore.
            }
        }
    }
}

function KeyboardBridge({
    node,
    onReady,
}: {
    node: ReactNode;
    onReady: (keyboard: ReturnType<typeof useInkKeyboardAdapter>) => void;
}) {
    const keyboard = useInkKeyboardAdapter();

    useLayoutEffect(() => {
        onReady(keyboard);
    }, [onReady, keyboard]);

    return node;
}
