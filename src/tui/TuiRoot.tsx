import type { AnyCommand } from "../core/command.ts";
import { useState } from "react";
import { LogsProvider } from "./context/LogsContext.tsx";
import { NavigationProvider, useNavigation } from "./context/NavigationContext.tsx";
import { TuiAppContextProvider, useTuiApp } from "./context/TuiAppContext.tsx";
import { ExecutorProvider } from "./context/ExecutorContext.tsx";
import { ActionProvider, useAction } from "./context/ActionContext.tsx";
import { useRenderer } from "./context/RendererContext.tsx";

import { TuiDriverProvider, useTuiDriver } from "./driver/context/TuiDriverContext.tsx";


interface TuiRootProps {
    name: string;
    displayName?: string;
    version: string;
    commands: AnyCommand[];
    onExit: () => void;
}

export function TuiRoot({ name, displayName, version, commands, onExit }: TuiRootProps) {
    return (
        <TuiAppContextProvider
            name={name}
            displayName={displayName}
            version={version}
            commands={commands}
            onExit={onExit}
        >
            <LogsProvider>
                <ExecutorProvider>
                    <NavigationProvider<{ commandPath: string[] }>
                        initialScreen={{ route: "commandBrowser", params: { commandPath: [] as string[] } }}
                        onExit={onExit}
                    >
                        <TuiDriverProvider appName={name} commands={commands}>
                            <TuiRootContent />
                        </TuiDriverProvider>
                    </NavigationProvider>
                </ExecutorProvider>
            </LogsProvider>
        </TuiAppContextProvider>
    );
}

/**
 * Main TUI content - renders current screen, modals, and handles global shortcuts.
 * This component knows NOTHING about specific screens or their logic.
 */
function TuiRootContent() {
    const { displayName, name, version } = useTuiApp();
    const driver = useTuiDriver();
    const navigation = useNavigation();
    const [copyToast, setCopyToast] = useState<string | null>(null);

    return (
        <ActionProvider navigation={navigation}>
            <TuiRootKeyboardHandler onCopyToastChange={setCopyToast} />
            {driver.renderAppShell({
                app: {
                    name,
                    displayName,
                    version,
                },
                copyToast,
            })}
        </ActionProvider>
    );
}

/**
 * Renders the adapter-specific keyboard handler component.
 * This component uses hooks properly since it's rendered as a React component.
 */
function TuiRootKeyboardHandler({ onCopyToastChange }: { onCopyToastChange: (toast: string | null) => void }) {
    const renderer = useRenderer();
    const { dispatchAction } = useAction();

    if (!renderer.renderKeyboardHandler) {
        return null;
    }

    return renderer.renderKeyboardHandler({ 
        dispatchAction, 
        getScreenKeyHandler: () => null,
        onCopyToastChange,
    });
}



