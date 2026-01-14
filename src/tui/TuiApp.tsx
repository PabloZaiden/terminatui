import type { AnyCommand } from "../core/command.ts";
import { useClipboard } from "./hooks/useClipboard.ts";
import { KeyboardProvider } from "./context/KeyboardContext.tsx";
import { useGlobalKeyHandler } from "./hooks/useGlobalKeyHandler.ts";
import { LogsProvider } from "./context/LogsContext.tsx";
import { NavigationProvider, useNavigation } from "./context/NavigationContext.tsx";
import { ClipboardProviderComponent, useClipboardContext } from "./context/ClipboardContext.tsx";
import { TuiAppContextProvider, useTuiApp } from "./context/TuiAppContext.tsx";
import { ExecutorProvider, useExecutor } from "./context/ExecutorContext.tsx";
import { Header } from "./components/Header.tsx";
import { StatusBar } from "./components/StatusBar.tsx";
import { Container } from "./semantic/Container.tsx";
import { Theme } from "./theme.ts";
import { getScreen, getModal, registerAllModals, registerAllScreens } from "./registry.tsx";
import { CommandSelectScreen, type CommandSelectParams } from "./screens/CommandSelectScreen.tsx";

// Register all screens and modals at module load
await registerAllScreens();
await registerAllModals();

interface TuiAppProps {
    name: string;
    displayName?: string;
    version: string;
    commands: AnyCommand[];
    onExit: () => void;
}

export function TuiApp({ name, displayName, version, commands, onExit }: TuiAppProps) {
    return (
        <KeyboardProvider>
            <ClipboardProviderComponent>
                <TuiAppContextProvider
                    name={name}
                    displayName={displayName}
                    version={version}
                    commands={commands}
                    onExit={onExit}
                >
                    <LogsProvider>
                        <ExecutorProvider>
                            <NavigationProvider<CommandSelectParams>
                                initialScreen={{ route: CommandSelectScreen.Id, params: { commandPath: [] } }}
                                onExit={onExit}
                            >
                                <TuiAppContent />
                            </NavigationProvider>
                        </ExecutorProvider>
                    </LogsProvider>
                </TuiAppContextProvider>
            </ClipboardProviderComponent>
        </KeyboardProvider>
    );
}

/**
 * Main TUI content - renders current screen, modals, and handles global shortcuts.
 * This component knows NOTHING about specific screens or their logic.
 */
function TuiAppContent() {
    const { displayName, name, version } = useTuiApp();
    const navigation = useNavigation();
    const executor = useExecutor();
    const clipboard = useClipboardContext();
    const { copyWithMessage, lastAction } = useClipboard();
    


    // Global keyboard handler - only truly global shortcuts
    useGlobalKeyHandler((key) => {
        // Esc - back/close (delegates to navigation which delegates to screen)
        if (key.name === "escape") {
            navigation.goBack();
            return true;
        }

        // Ctrl+Y - copy
        if (key.ctrl && key.name === "y") {
            const content = clipboard.getContent();
            if (content) {
                copyWithMessage(content.content, content.label);
            }
            return true;
        }

        // Ctrl+L - toggle logs modal
        if (key.ctrl && key.name === "l") {
            const isLogsOpen = navigation.modalStack.some((m) => m.id === "logs");
            if (isLogsOpen) {
                navigation.closeModal();
            } else {
                 navigation.openModal("logs", {});

            }
            return true;
        }

        return false;
    });

    // Get current screen component from registry
    const ScreenComponent = getScreen(navigation.current.route);
    
    // Get breadcrumb from current screen params (if available)
    const params = navigation.current.params as { commandPath?: string[] } | undefined;
    const breadcrumb = params?.commandPath;

    return (
        <box flexDirection="column" flexGrow={1} padding={1} backgroundColor={Theme.colors.background}>
            <Container flexDirection="column" flex={1}>
                <Header name={displayName ?? name} version={version} breadcrumb={breadcrumb} />

            <Container flexDirection="column" flex={1}>
                {ScreenComponent ? <ScreenComponent /> : null}
            </Container>

            <StatusBar
                status={lastAction || (executor.isExecuting ? "Executing..." : "Ready")}
                isRunning={executor.isExecuting}
                shortcuts="Esc Back • Ctrl+Y Copy • Ctrl+L Logs"
            />

            {/* Render modals from registry */}
            {navigation.modalStack.map((modal, idx) => {
                const ModalComponent = getModal(modal.id);
                if (!ModalComponent) return null;

                return (
                    <ModalComponent
                        key={`modal-${modal.id}-${idx}`}
                        params={modal.params}
                        onClose={() => navigation.closeModal()}
                    />
                );
            })}
            </Container>
        </box>
    );
}
