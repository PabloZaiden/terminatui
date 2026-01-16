import { createCliRenderer, type CliRenderer } from "@opentui/core";
import { createRoot, type Root } from "@opentui/react";
import { useEffect, useLayoutEffect, useState, type ReactNode } from "react";
import { SemanticColors } from "../../theme.ts";
import type { KeyboardEvent, Renderer, RendererConfig } from "../types.ts";
import { SemanticOpenTuiRenderer } from "./SemanticOpenTuiRenderer.tsx";
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
import { Spinner } from "./components/Spinner.tsx";
import { Panel } from "./components/Panel.tsx";
import { ScrollView as OpenTuiScrollView } from "./components/ScrollView.tsx";
import { Select } from "./components/Select.tsx";
import { TextInput } from "./components/TextInput.tsx";
import { Value } from "./components/Value.tsx";

import { copyToTerminalClipboard } from "../shared/TerminalClipboard.ts";
import { useTuiDriver } from "../../driver/context/TuiDriverContext.tsx";
import type { TuiAction } from "../../actions.ts";

function OpenTuiKeyboardHandler({
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

export class OpenTuiRenderer implements Renderer {
    private readonly semanticRenderer = new SemanticOpenTuiRenderer();

    private copyToast: string | null = null;
    private forceRerenderFn: (() => void) | null = null;

    private semanticScreenKeyHandler: ((event: KeyboardEvent) => boolean) | null = null;

    private setCopyToast = (message: string | null) => {
        this.copyToast = message;
        this.forceRerenderFn?.();
    };

    public renderSemanticAppShell: Renderer["renderSemanticAppShell"] = (props) => {
        return this.semanticRenderer.renderAppShell({ ...props, copyToast: this.copyToast });
    };
    public renderSemanticCommandBrowserScreen: Renderer["renderSemanticCommandBrowserScreen"] = (props) => {
        this.semanticScreenKeyHandler = (event) => {
            if (event.ctrl && event.name === "l") {
                // Adapter-owned logs open — let global handler process it.
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
                // Adapter-owned logs open — let global handler process it.
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
            <OpenTuiKeyboardHandlerWrapper
                dispatchAction={dispatchAction}
                getScreenKeyHandler={() => this.semanticScreenKeyHandler}
                keyboard={this.keyboard}
                setCopyToast={this.setCopyToast}
                setForceRerender={(fn) => { this.forceRerenderFn = fn; }}
            />
        );
    };

    private renderer: CliRenderer | null = null;
    private root: Root | null = null;

    private activeKeyboardAdapter: Renderer["keyboard"] | null = null;

    public supportCustomRendering(): boolean {
        return true;
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
        ScrollView: OpenTuiScrollView,

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

function OpenTuiKeyboardHandlerWrapper({
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
        <OpenTuiKeyboardHandler
            dispatchAction={dispatchAction}
            getScreenKeyHandler={getScreenKeyHandler}
            keyboard={keyboard}
            setCopyToast={setCopyToast}
        />
    );
}
