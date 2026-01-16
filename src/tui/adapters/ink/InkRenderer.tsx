import { render } from "ink";
import type { ReactNode } from "react";
import { useEffect, useLayoutEffect, useState } from "react";

import type { KeyboardEvent, Renderer, RendererConfig } from "../types.ts";
import { SemanticInkRenderer } from "./SemanticInkRenderer.tsx";
import { useInkKeyboardAdapter } from "./keyboard.ts";
import { copyToTerminalClipboard } from "../shared/TerminalClipboard.ts";
import { useTuiDriver } from "../../driver/context/TuiDriverContext.tsx";

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
import { Spinner } from "./components/Spinner.tsx";
import { TextInput } from "./components/TextInput.tsx";
import { Value } from "./components/Value.tsx";
import { Code } from "./components/Code.tsx";
import { CodeHighlight } from "./components/CodeHighlight.tsx";
import type { TuiAction } from "../../actions.ts";

function InkKeyboardHandler({
    dispatchAction,
    getScreenKeyHandler,
    keyboard,
    setCopyToast,
}: {
    dispatchAction: (action: TuiAction) => void;
    getScreenKeyHandler: () => ((event: KeyboardEvent) => boolean) | null;
    keyboard: Renderer["keyboard"];
    setCopyToast: (message: string | null) => void;
}) {
    const driver = useTuiDriver();

    useEffect(() => {
        const cleanup = keyboard.setGlobalHandler((event) => {
            // Debug: log keyboard events
            // console.log("Key event:", event.name, "screenHandler:", getScreenKeyHandler() ? "yes" : "no");
            
            if (event.name === "escape") {
                dispatchAction({ type: "nav.back" });
                return true;
            }

            if (event.ctrl && event.name === "y") {
                const payload = driver.getActiveCopyPayload();
                if (payload) {
                    void copyToTerminalClipboard(payload.content).then(() => {
                        setCopyToast(`Copied ${payload.label}`);
                        setTimeout(() => setCopyToast(null), 1500);
                    });
                }
                return true;
            }

            if (event.ctrl && event.name === "l") {
                dispatchAction({ type: "logs.open" });
                return true;
            }

            const screenHandler = getScreenKeyHandler();
            if (screenHandler) {
                return screenHandler(event);
            }

            return false;
        });

        return cleanup;
    }, [dispatchAction, getScreenKeyHandler, keyboard, driver, setCopyToast]);

    return null;
}

export class InkRenderer implements Renderer {

    private readonly semanticRenderer = new SemanticInkRenderer();

    private copyToast: string | null = null;
    private forceRerenderFn: (() => void) | null = null;

    private semanticScreenKeyHandler: ((event: KeyboardEvent) => boolean) | null = null;

    private setCopyToast = (message: string | null) => {
        this.copyToast = message;
        this.forceRerenderFn?.();
    };

    public renderSemanticAppShell: Renderer["renderSemanticAppShell"] = (props) => {
        // UI policy: transient copy feedback is adapter-owned.
        return this.semanticRenderer.renderAppShell({ ...props, copyToast: this.copyToast });
    };
    public renderSemanticCommandBrowserScreen: Renderer["renderSemanticCommandBrowserScreen"] = (props) => {
        this.semanticScreenKeyHandler = (event) => {
            if (event.ctrl && event.name === "l") {
                // Logs open is adapter-owned.
                return false;
            }

            if (event.name === "up") {
                props.onSelectCommand(props.selectedCommandIndex - 1);
                return true;
            }

            if (event.name === "down") {
                props.onSelectCommand(props.selectedCommandIndex + 1);
                return true;
            }

            if (event.name === "return") {
                props.onRunSelected();
                return true;
            }

            return false;
        };

        return this.semanticRenderer.renderCommandBrowserScreen(props);
    };

    public renderSemanticConfigScreen: Renderer["renderSemanticConfigScreen"] = (props) => {
        this.semanticScreenKeyHandler = (event) => {
            if (event.ctrl && event.name === "l") {
                // Adapter-owned logs open.
                return false;
            }

            if (event.name === "up") {
                props.onSelectionChange(props.selectedFieldIndex - 1);
                return true;
            }

            if (event.name === "down") {
                props.onSelectionChange(props.selectedFieldIndex + 1);
                return true;
            }

            if (event.name === "return") {
                const fieldConfig = props.fieldConfigs[props.selectedFieldIndex];
                if (fieldConfig) {
                    props.onEditField(fieldConfig.key);
                } else {
                    props.onRun();
                }
                return true;
            }

            return false;
        };

        return this.semanticRenderer.renderConfigScreen(props);
    };
    public renderSemanticRunningScreen: Renderer["renderSemanticRunningScreen"] = (props) => {
        this.semanticScreenKeyHandler = null;
        return this.semanticRenderer.renderRunningScreen(props);
    };
    public renderSemanticLogsScreen: Renderer["renderSemanticLogsScreen"] = (props) => {
        this.semanticScreenKeyHandler = (event) => {
            if (event.name === "return") {
                props.onClose();
                return true;
            }
            return false;
        };

        return this.semanticRenderer.renderLogsScreen(props);
    };

    public renderSemanticEditorScreen: Renderer["renderSemanticEditorScreen"] = (props) => {
        this.semanticScreenKeyHandler = (event) => {
            if (event.name === "return") {
                props.onSubmit?.();
                return true;
            }
            return false;
        };

        return this.semanticRenderer.renderEditorScreen(props);
    };

    public renderKeyboardHandler: Renderer["renderKeyboardHandler"] = ({ dispatchAction }) => {
        return (
            <InkKeyboardHandlerWrapper
                dispatchAction={dispatchAction}
                getScreenKeyHandler={() => this.semanticScreenKeyHandler}
                keyboard={this.keyboard}
                setCopyToast={this.setCopyToast}
                setForceRerender={(fn) => { this.forceRerenderFn = fn; }}
            />
        );
    };

    private instance: ReturnType<typeof render> | null = null;
    private activeKeyboardAdapter: Renderer["keyboard"] | null = null;

    public supportCustomRendering(): boolean {
        return false;
    }

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
        Spinner,

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
                stdout: process.stdout,
                stdin: process.stdin,
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

function InkKeyboardHandlerWrapper({
    dispatchAction,
    getScreenKeyHandler,
    keyboard,
    setCopyToast,
    setForceRerender,
}: {
    dispatchAction: (action: TuiAction) => void;
    getScreenKeyHandler: () => ((event: KeyboardEvent) => boolean) | null;
    keyboard: Renderer["keyboard"];
    setCopyToast: (message: string | null) => void;
    setForceRerender: (fn: () => void) => void;
}) {
    const [, setTick] = useState(0);

    useLayoutEffect(() => {
        setForceRerender(() => setTick((x) => x + 1));
    }, [setForceRerender]);

    return (
        <InkKeyboardHandler
            dispatchAction={dispatchAction}
            getScreenKeyHandler={getScreenKeyHandler}
            keyboard={keyboard}
            setCopyToast={setCopyToast}
        />
    );
}
