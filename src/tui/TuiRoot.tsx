import type { AnyCommand } from "../core/command.ts";
import { LogsProvider } from "./context/LogsContext.tsx";
import { NavigationProvider, useNavigation } from "./context/NavigationContext.tsx";
import { TuiAppContextProvider, useTuiApp } from "./context/TuiAppContext.tsx";
import { ExecutorProvider } from "./context/ExecutorContext.tsx";
import { ActionProvider } from "./context/ActionContext.tsx";
import { useRenderer } from "./context/RendererContext.tsx";
import { copyToClipboard } from "./hooks/useClipboard.ts";


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
                        <TuiRootActionProvider>
                            {() => (
                                <TuiDriverProvider appName={name} commands={commands}>
                                    <TuiRootContent />
                                </TuiDriverProvider>
                            )}
                        </TuiRootActionProvider>

                    </NavigationProvider>
                </ExecutorProvider>
            </LogsProvider>
        </TuiAppContextProvider>
    );
}

function TuiRootActionProvider({ children }: { children: () => React.ReactNode }) {
    return children();
}

/**
 * Main TUI content - renders current screen, modals, and handles global shortcuts.
 * This component knows NOTHING about specific screens or their logic.
 */
function TuiRootContent() {
    const { displayName, name, version } = useTuiApp();
    const driver = useTuiDriver();
    const renderer = useRenderer();
    const navigation = useNavigation();

    return (
        <ActionProvider
            navigation={navigation}
            onDispatchAction={(dispatchAction) => {
                if (!renderer.registerActionDispatcher) {
                    return () => {};
                }

                return renderer.registerActionDispatcher((action) => {
                    if (action.type === "copy") {
                        const payload = driver.getActiveCopyPayload();
                        if (!payload) {
                            return;
                        }

                        void copyToClipboard(payload.content);
                        return;
                    }

                    dispatchAction(action);
                });
            }}
        >
            {driver.renderAppShell({
                app: {
                    name,
                    displayName,
                    version,
                },
            })}
        </ActionProvider>
    );
}



