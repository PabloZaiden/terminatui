import { useCallback, useEffect, useState } from "react";
import type { AnyCommand, CommandResult } from "../core/command.ts";
import { AppContext } from "../core/context.ts";
import type { OptionDef, OptionSchema, OptionValues } from "../types/command.ts";
import { useClipboard } from "./hooks/useClipboard.ts";
import { KeyboardPriority, KeyboardProvider } from "./context/KeyboardContext.tsx";
import { useCommandExecutor } from "./hooks/useCommandExecutor.ts";
import { useKeyboardHandler } from "./hooks/useKeyboardHandler.ts";
import { Header } from "./components/Header.tsx";
import { StatusBar } from "./components/StatusBar.tsx";
import { EditorModal } from "./components/EditorModal.tsx";
import { CliModal } from "./components/CliModal.tsx";
import { LogsModal } from "./components/LogsModal.tsx";
import type { LogEvent } from "../core/logger.ts";
import { NavigationProvider, useNavigation } from "./context/NavigationContext.tsx";
import type { ModalEntry, ScreenEntry } from "./context/NavigationContext.tsx";
import type { Modals, Routes } from "./routes.ts";
import { CommandSelectScreen } from "./screens/CommandSelectScreen.tsx";
import { ConfigScreen } from "./screens/ConfigScreen.tsx";
import { RunningScreen } from "./screens/RunningScreen.tsx";
import { ResultsScreen } from "./screens/ResultsScreen.tsx";
import { ErrorScreen } from "./screens/ErrorScreen.tsx";
import { loadPersistedParameters, savePersistedParameters } from "./utils/parameterPersistence.ts";
import { schemaToFieldConfigs } from "./utils/schemaToFields.ts";
import { buildCliCommand } from "./utils/buildCliCommand.ts";

interface TuiAppProps {
    name: string;
    displayName?: string;
    version: string;
    commands: AnyCommand[];
    onExit: () => void;
}

export function TuiApp(props: TuiAppProps) {
    return (
        <KeyboardProvider>
            <NavigationProvider<Routes, Modals>
                initialScreen={{ route: "command-select", params: { commandPath: [], selectedIndex: 0 } }}
            >
                <TuiAppContent {...props} />
            </NavigationProvider>
        </KeyboardProvider>
    );
}

function TuiAppContent({ name, displayName, version, commands, onExit }: TuiAppProps) {
    const navigation = useNavigation<Routes, Modals>();
    const { current, modalStack } = navigation;
    const [logHistory, setLogHistory] = useState<LogEvent[]>([]);

    useEffect(() => {
        AppContext.current.setService("commands", commands);
    }, [commands]);

    useEffect(() => {
        const unsubscribe = AppContext.current.logger.onLogEvent((event: LogEvent) => {
            setLogHistory((prev) => [...prev, event]);
        });
        return () => {
            unsubscribe?.();
        };
    }, []);

    const { copyWithMessage, lastAction } = useClipboard();

    const executeCommand = useCallback(async (cmd: AnyCommand, values: Record<string, unknown>, signal: AbortSignal) => {
        let configOrValues: unknown = values;
        if (cmd.buildConfig) {
            configOrValues = await cmd.buildConfig(values as OptionValues<OptionSchema>);
        }

        return await cmd.execute(configOrValues as OptionValues<OptionSchema>, { signal });
    }, []);

    const { isExecuting, result, error, execute, cancel, reset: resetExecutor } = useCommandExecutor<CommandResult>(
        (cmd: unknown, values: unknown, signal: unknown) =>
            executeCommand(cmd as AnyCommand, values as Record<string, unknown>, signal as AbortSignal)
    );

    const handleBack = useCallback(() => {
        if (navigation.modalStack.length > 0) {
            navigation.closeModal();
            return;
        }
        if (isRoute(current, "running") && isExecuting) {
            cancel();
            resetExecutor();
        }
        if (isRoute(current, "command-select") && current.params?.commandPath.length) {
            const nextPath = current.params.commandPath.slice(0, -1);
            navigation.replace({ route: "command-select", params: { commandPath: nextPath, selectedIndex: 0 } });
            return;
        }
        if (navigation.stack.length > 1) {
            navigation.pop();
            return;
        }
        if (isRoute(current, "command-select") && !current.params?.commandPath.length) {
            onExit();
            return;
        }
        // Fallback to exit
        onExit();
    }, [navigation, current, isExecuting, cancel, resetExecutor, onExit]);

    useKeyboardHandler(
        (event) => {
            const { key } = event;

            if (key.name === "escape") {
                handleBack();
                event.stopPropagation();
                return;
            }

            if (key.name === "y") {
                const content = getClipboardContent();
                if (content) {
                    copyWithMessage(content.content, content.label);
                }
                event.stopPropagation();
                return;
            }

            if (key.name === "l") {
                // Toggle logs modal, feed live logHistory so it updates while open
                const isLogsOpen = modalStack.length > 0 && modalStack[modalStack.length - 1]?.id === "logs";
                if (isLogsOpen) {
                    navigation.closeModal();
                } else {
                    navigation.openModal({
                        id: "logs",
                        params: {
                            logs: logHistory,
                            onClose: () => navigation.closeModal(),
                        },
                    });
                }
                event.stopPropagation();
                return;
            }

            if ((key.name === "return" || key.name === "enter") && modalStack.length > 0) {
                const topModal = modalStack[modalStack.length - 1];
                if (topModal && (isModal(topModal, "logs") || isModal(topModal, "cli-arguments"))) {
                    navigation.closeModal();
                    event.stopPropagation();
                    return;
                }
            }

            if (key.name === "c" && isRoute(current, "config") && current.params) {
                const { command, commandPath, values } = current.params;
                const cli = buildCliCommand(name, commandPath, command.options, values as OptionValues<OptionSchema>);
                navigation.openModal({ id: "cli-arguments", params: { command: cli, onClose: () => navigation.closeModal() } });
                event.stopPropagation();
                return;
            }
        },
        KeyboardPriority.Global,
        { enabled: true }
    );

    const getClipboardContent = useCallback((): { content: string; label: string } | null => {
        const modal = modalStack[modalStack.length - 1];
        if (modal && isModal(modal, "logs")) {
            return { content: logHistory.map((l) => l.message).join("\n"), label: "Logs" };
        }

        if (modal && isModal(modal, "cli-arguments") && modal.params) {
            return { content: modal.params.command, label: "CLI" };
        }

        if (isRoute(current, "results") && current.params && result) {
            const { command } = current.params;
            if (command.getClipboardContent) {
                const custom = command.getClipboardContent(result);
                if (custom) return { content: custom, label: "Results" };
            }
            return { content: JSON.stringify(result, null, 2), label: "Results" };
        }

        if (isRoute(current, "error") && current.params && error) {
            return { content: error.message, label: "Error" };
        }

        if (isRoute(current, "config") && current.params) {
            return { content: JSON.stringify(current.params.values ?? {}, null, 2), label: "Config" };
        }

        return null;
    }, [modalStack, logHistory, current, result, error]);

    const renderScreen = () => {
        switch (current.route) {
            case "command-select": {
                const params = isRoute(current, "command-select") && current.params
                    ? current.params
                    : { commandPath: [], selectedIndex: 0 };
                const entry: ScreenEntry<Routes, "command-select"> = { route: "command-select", params };

                return (
                    <CommandSelectScreen
                        entry={entry}
                        commands={commands}
                        onSelectCommand={(cmd, path) => {
                            if (cmd.subCommands && cmd.subCommands.some((c) => c.supportsTui())) {
                                navigation.replace({
                                    route: "command-select",
                                    params: { commandPath: [...path, cmd.name], selectedIndex: 0 },
                                });
                                return;
                            }

                            navigation.push({
                                route: "config",
                                params: {
                                    command: cmd,
                                    commandPath: [...path, cmd.name],
                                    values: initializeConfigValues(name, cmd),
                                    selectedFieldIndex: 0,
                                    fieldConfigs: schemaToFieldConfigs(cmd.options),
                                },
                            });
                        }}
                        onChangeSelection={(index) => {
                            navigation.replace({
                                route: "command-select",
                                params: { commandPath: params.commandPath, selectedIndex: index },
                            });
                        }}
                        onBack={handleBack}
                    />

                );
            }
            case "config": {
                if (!isRoute(current, "config") || !current.params) return null;
                const params = current.params;
                const entry: ScreenEntry<Routes, "config"> = { route: "config", params };

                return (
                    <ConfigScreen
                        entry={entry}
                        navigation={navigation}
                        onRun={async (values) => {
                            savePersistedParameters(name, params.command.name, values);
                            const runParams: Routes["running"] = {
                                command: params.command,
                                commandPath: params.commandPath,
                                values,
                            };
                            navigation.push({
                                route: "running",
                                params: runParams,
                            });
                            const outcome = await execute(params.command, values);
                            if (outcome.cancelled) return;
                            if (outcome.success) {
                                const resultParams: Routes["results"] = {
                                    command: params.command,
                                    commandPath: params.commandPath,
                                    values,
                                    result: outcome.result ?? null,
                                };
                                navigation.replace({
                                    route: "results",
                                    params: resultParams,
                                });
                            } else {
                                const errorParams: Routes["error"] = {
                                    command: params.command,
                                    commandPath: params.commandPath,
                                    values,
                                    error: outcome.error ?? new Error("Unknown error"),
                                };
                                navigation.replace({
                                    route: "error",
                                    params: errorParams,
                                });
                            }
                        }}
                        onEditField={(fieldKey) => {
                            const { values } = params;
                            navigation.openModal({
                                id: "property-editor",
                                params: {
                                    fieldKey,
                                    currentValue: values[fieldKey],
                                    fieldConfigs: params.fieldConfigs,
                                    onSubmit: (value: unknown) => {
                                        const nextValues = { ...values, [fieldKey]: value };
                                        const nextParams: Routes["config"] = { ...params, values: nextValues };
                                        navigation.replace({ route: "config", params: nextParams });
                                        navigation.closeModal();
                                    },
                                    onCancel: () => navigation.closeModal(),
                                },
                            });
                        }}
                    />
                );
            }
            case "running": {
                if (!isRoute(current, "running") || !current.params) return null;
                const entry: ScreenEntry<Routes, "running"> = { route: "running", params: current.params };
                return <RunningScreen entry={entry} navigation={navigation} />;
            }
            case "results": {
                if (!isRoute(current, "results") || !current.params) return null;
                const entry: ScreenEntry<Routes, "results"> = { route: "results", params: current.params };
                return <ResultsScreen entry={entry} />;
            }
            case "error": {
                if (!isRoute(current, "error") || !current.params) return null;
                const entry: ScreenEntry<Routes, "error"> = { route: "error", params: current.params };
                return <ErrorScreen entry={entry} />;
            }
            default:
                return null;
        }
    };

    const breadcrumb = getCommandPath(current)?.commandPath;

    return (
        <box flexDirection="column" flexGrow={1} padding={1}>
            <Header name={displayName ?? name} version={version} breadcrumb={breadcrumb} />

            <box key={`content-${current.route}-${isExecuting}`} flexDirection="column" flexGrow={1}>
                {renderScreen()}
            </box>

            <StatusBar
                status={lastAction ?? (isExecuting ? "Executing..." : "Ready")}
                isRunning={isExecuting}
                shortcuts="Esc Back • Y Copy • L Logs • C CLI arguments"
            />

            {modalStack.map((modal, idx) => {
                if (isModal(modal, "property-editor") && modal.params) {
                    const params = modal.params;
                    return (
                        <EditorModal
                            key={`modal-${idx}`}
                            fieldKey={params.fieldKey}
                            currentValue={params.currentValue}
                            visible={true}
                            onSubmit={(value) => params.onSubmit?.(value)}
                            onCancel={() => params.onCancel?.()}
                            fieldConfigs={params.fieldConfigs}
                        />
                    );
                }

                if (isModal(modal, "cli-arguments") && modal.params) {
                    const params = modal.params;
                    return (
                        <CliModal
                            key={`modal-${idx}`}
                            command={params.command}
                            visible={true}
                            onClose={() => params.onClose?.() ?? navigation.closeModal()}
                        />
                    );
                }

                if (isModal(modal, "logs") && modal.params) {
                    const params = modal.params;
                    return (
                        <LogsModal
                            key={`modal-${idx}`}
                            logs={logHistory}
                            visible={true}
                            onClose={() => params.onClose?.() ?? navigation.closeModal()}
                        />
                    );
                }

                return null;
            })}
        </box>
    );
}

function initializeConfigValues(name: string, cmd: AnyCommand) {
    const defaults: Record<string, unknown> = {};
    const optionDefs = cmd.options as OptionSchema;
    for (const [key, def] of Object.entries(optionDefs)) {
        const typedDef = def as OptionDef;
        if (typedDef.default !== undefined) {
            defaults[key] = typedDef.default;
        } else {
            switch (typedDef.type) {
                case "string":
                    defaults[key] = typedDef.enum?.[0] ?? "";
                    break;
                case "number":
                    defaults[key] = typedDef.min ?? 0;
                    break;
                case "boolean":
                    defaults[key] = false;
                    break;
                case "array":
                    defaults[key] = [];
                    break;
            }
        }
    }

    const persisted = loadPersistedParameters(name, cmd.name);
    return { ...defaults, ...persisted };
}

function isRoute<R extends keyof Routes>(entry: ScreenEntry<Routes>, route: R): entry is ScreenEntry<Routes, R> {
    return entry.route === route;
}

function isModal<ID extends keyof Modals>(modal: ModalEntry<Modals>, id: ID): modal is ModalEntry<Modals, ID> {
    return modal.id === id;
}

function getCommandPath(entry: ScreenEntry<Routes>) {
    if (!entry.params) return undefined;
    if ("commandPath" in entry.params) {
        return { commandPath: entry.params.commandPath };
    }
    return undefined;
}
