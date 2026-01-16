import type { AnyCommand } from "../core/command.ts";
import { useMemo, useState } from "react";
import { useClipboard, type UseClipboardResult } from "./hooks/useClipboard.ts";
import { useClipboardProvider } from "./hooks/useClipboardProvider.ts";
import { LogsProvider } from "./context/LogsContext.tsx";
import { NavigationProvider, useNavigation } from "./context/NavigationContext.tsx";
import { ClipboardProviderComponent, useClipboardContext } from "./context/ClipboardContext.tsx";
import { TuiAppContextProvider, useTuiApp } from "./context/TuiAppContext.tsx";
import { ExecutorProvider, useExecutor } from "./context/ExecutorContext.tsx";
import { ActionProvider } from "./context/ActionContext.tsx";
import { RenderAppShell, RenderCommandBrowserScreen, RenderConfigScreen, RenderRunningScreen, RenderLogsScreen, RenderEditorScreen } from "./semantic/render.tsx";
import { useRenderer } from "./context/RendererContext.tsx";
import { useLogs } from "./context/LogsContext.tsx";

import type { OptionSchema } from "../types/command.ts";
import { schemaToFieldConfigs } from "./utils/schemaToFields.ts";
import { buildCliCommand } from "./utils/buildCliCommand.ts";
import { savePersistedParameters, loadPersistedParameters } from "./utils/parameterPersistence.ts";
import type { OptionDef } from "../types/command.ts";

type EditorModalParams = {
    fieldKey: string;
    currentValue: unknown;
    fieldConfigs: ReturnType<typeof schemaToFieldConfigs>;
    cliCommand?: string;
    onCopyCliArguments?: () => void;
    onSubmit: (value: unknown) => void;
    onCancel: () => void;
};

type EditorBufferState = {
    fieldKey: string;
    valueString: string;
} | null;


type TuiRoute = "commandBrowser" | "config" | "running" | "results" | "error";


interface TuiRootProps {
    name: string;
    displayName?: string;
    version: string;
    commands: AnyCommand[];
    onExit: () => void;
}

export function TuiRoot({ name, displayName, version, commands, onExit }: TuiRootProps) {
    return (
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
                        <NavigationProvider<{ commandPath: string[] }>
                            initialScreen={{ route: "commandBrowser", params: { commandPath: [] as string[] } }}
                            onExit={onExit}
                        >
                            <TuiRootActionProvider>
                                {(clipboard) => <TuiRootContent clipboard={clipboard} />}
                            </TuiRootActionProvider>
                        </NavigationProvider>
                    </ExecutorProvider>
                </LogsProvider>
            </TuiAppContextProvider>
        </ClipboardProviderComponent>
    );
}

function TuiRootActionProvider({ children }: { children: (clipboard: UseClipboardResult) => React.ReactNode }) {
    // Keep a single clipboard hook instance shared by action dispatch and status bar.
    const clipboard: UseClipboardResult = useClipboard();

    const navigation = useNavigation();
    const clipboardContext = useClipboardContext();
    const renderer = useRenderer();

    return (
        <ActionProvider
            navigation={navigation}
            clipboardContext={clipboardContext}
            clipboard={clipboard}
            onDispatchAction={renderer.registerActionDispatcher}
        >
            {children(clipboard)}
        </ActionProvider>
    );
}

/**
 * Main TUI content - renders current screen, modals, and handles global shortcuts.
 * This component knows NOTHING about specific screens or their logic.
 */
function TuiRootContent({ clipboard }: { clipboard: UseClipboardResult }) {
    const { displayName, name, version, commands } = useTuiApp();
    const navigation = useNavigation();
    const executor = useExecutor();
    const { logs } = useLogs();

    const routeClipboardContent = useMemo(() => {
        const route = navigation.current.route as TuiRoute;

        if (route === "config") {
            const params = navigation.current.params as
                | {
                      command: AnyCommand;
                      commandPath: string[];
                      values: Record<string, unknown>;
                  }
                | undefined;

            if (!params) {
                return null;
            }

            const schema = params.command.options as OptionSchema;
            const cli = buildCliCommand(name, params.commandPath, schema, params.values as any);

            return {
                label: "CLI",
                content: cli,
            };
        }

        return null;
    }, [name, navigation.current.params, navigation.current.route]);

    useClipboardProvider(() => routeClipboardContent);

    useClipboardProvider(
        () => {
            const topModal = navigation.modalStack[navigation.modalStack.length - 1];

            if (topModal?.id === "logs") {
                const tail = logs.slice(-200);
                const text = tail
                    .map((l) => {
                        const t = l.timestamp.toISOString();
                        return `[${t}] ${String(l.level).toUpperCase()}: ${String(l.message)}`;
                    })
                    .join("\n");

                return {
                    label: "Logs",
                    content: text,
                };
            }

            if (topModal?.id === "editor") {
                const params = topModal.params as EditorModalParams | undefined;
                if (!params) {
                    return null;
                }

                const valueString =
                    editorBuffer?.fieldKey === params.fieldKey
                        ? editorBuffer.valueString
                        : String(params.currentValue ?? "");

                return {
                    label: `Field: ${params.fieldKey}`,
                    content: valueString,
                };
            }

            return null;
        },
        navigation.modalStack.length > 0
    );

    const [commandSelectedIndex, setCommandSelectedIndex] = useState(0);
    const [configSelectedFieldIndex, setConfigSelectedFieldIndex] = useState(0);
    const [editorBuffer, setEditorBuffer] = useState<EditorBufferState>(null);

    const statusMessage = clipboard.lastAction || (executor.isExecuting ? "Executing..." : "Ready");

    const currentRoute = navigation.current.route as TuiRoute;


    let screenNode: React.ReactNode = null;
    let breadcrumb: string[] | undefined;

    if (currentRoute === "commandBrowser") {
        const params = (navigation.current.params ?? { commandPath: [] }) as { commandPath: string[] };
        const commandPath = params.commandPath ?? [];
        breadcrumb = commandPath;

        const currentCommands = getCommandsAtPath(commands, commandPath);

        screenNode = (
            <RenderCommandBrowserScreen
                commandId={commandPath}
                commands={currentCommands}
                selectedCommandIndex={Math.min(commandSelectedIndex, Math.max(0, currentCommands.length - 1))}
                onOpenPath={(nextPath) => {
                    setCommandSelectedIndex(0);
                    navigation.replace("commandBrowser", { commandPath: nextPath });
                }}
                onSelectCommand={(index) => {
                    const nextIndex = Math.max(0, Math.min(index, Math.max(0, currentCommands.length - 1)));
                    setCommandSelectedIndex(nextIndex);
                }}
                onRunSelected={() => {
                    const selected = currentCommands[commandSelectedIndex];
                    if (!selected) {
                        return;
                    }

                    setConfigSelectedFieldIndex(0);
                    navigation.push("config", {
                        command: selected,
                        commandPath,
                        values: initializeConfigValues(name, selected),
                        fieldConfigs: schemaToFieldConfigs(selected.options),
                    });
                }}
            />
        );
     } else if (currentRoute === "config") {
        const params = navigation.current.params as {
            command: AnyCommand;
            commandPath: string[];
            values: Record<string, unknown>;
            fieldConfigs: ReturnType<typeof schemaToFieldConfigs>;
        } | undefined;

        if (params) {
            breadcrumb = params.commandPath;
            const title = `Configure: ${params.command.displayName ?? params.command.name}`;

            screenNode = (
                <RenderConfigScreen
                    title={title}
                    commandId={params.commandPath}
                    fieldConfigs={params.fieldConfigs}
                    values={params.values}
                    selectedFieldIndex={Math.min(configSelectedFieldIndex, Math.max(0, params.fieldConfigs.length))}
                    onSelectionChange={(index) => {
                        const maxIndex = params.fieldConfigs.length;
                        const nextIndex = Math.max(0, Math.min(index, maxIndex));
                        setConfigSelectedFieldIndex(nextIndex);
                    }}
                    onEditField={(fieldId) => {
                        const fieldValue = params.values[fieldId];
                        setEditorBuffer({
                            fieldKey: fieldId,
                            valueString: String(fieldValue ?? ""),
                        });

                        const schema = params.command.options as OptionSchema;
                        const cli = buildCliCommand(name, params.commandPath, schema, params.values as any);

                        navigation.openModal<EditorModalParams>("editor", {
                            fieldKey: fieldId,
                            currentValue: fieldValue,
                            fieldConfigs: params.fieldConfigs,
                            cliCommand: cli,
                            onCopyCliArguments: () => {
                                clipboard.copyWithMessage(cli, "CLI");
                            },
                            onSubmit: (value: unknown) => {
                                navigation.replace("config", {
                                    ...params,
                                    values: { ...params.values, [fieldId]: value },
                                });
                                navigation.closeModal();
                                setEditorBuffer(null);
                            },
                            onCancel: () => {
                                navigation.closeModal();
                                setEditorBuffer(null);
                            },
                        });
                    }}
                    onRun={() => {
                        void (async () => {
                            savePersistedParameters(name, params.command.name, params.values);
                            navigation.push("running", {
                                command: params.command,
                                commandPath: params.commandPath,
                                values: params.values,
                            });

                            const outcome = await executor.execute(params.command, params.values);
                            if (outcome.cancelled) {
                                navigation.pop();
                                return;
                            }

                            if (outcome.success) {
                                navigation.replace("results", {
                                    command: params.command,
                                    commandPath: params.commandPath,
                                    values: params.values,
                                    result: outcome.result ?? null,
                                });
                            } else {
                                navigation.replace("error", {
                                    command: params.command,
                                    commandPath: params.commandPath,
                                    values: params.values,
                                    error: outcome.error ?? new Error("Unknown error"),
                                });
                            }
                        })();
                    }}
                />
            );
        }
     } else if (currentRoute === "running") {
        screenNode = <RenderRunningScreen title="Running" kind="running" />;
     } else if (currentRoute === "results") {
        const params = navigation.current.params as { result: unknown } | undefined;
        screenNode = <RenderRunningScreen title="Results" kind="results" message={String(params?.result ?? "")} />;
     } else if (currentRoute === "error") {
        const params = navigation.current.params as { error: Error } | undefined;
        screenNode = <RenderRunningScreen title="Error" kind="error" message={String(params?.error?.message ?? "Unknown error")} />;
     } else {
        screenNode = null;
     }


    const modalNodes: React.ReactNode[] = navigation.modalStack.map((modal) => {
        if (modal.id === "logs") {
            return (
                 <RenderLogsScreen
                     key="modal-logs"
                     items={logs.map((l) => ({
                         level: String(l.level),
                         message: String(l.message),
                         timestamp: l.timestamp.getTime(),
                     }))}
                     onClose={() => navigation.closeModal()}
                 />

            );
        }

        if (modal.id === "editor") {
            const params = modal.params as EditorModalParams | undefined;
            if (!params) {
                return null;
            }

            const fieldConfig = params.fieldConfigs.find((f) => f.key === params.fieldKey);
            const bufferString = editorBuffer?.fieldKey === params.fieldKey ? editorBuffer.valueString : undefined;

            const canShowCli = Boolean(params.cliCommand && params.onCopyCliArguments);

            if (fieldConfig?.type === "enum") {
                const options = (fieldConfig.options ?? []).map((o) => ({
                    label: String(o.name),
                    value: String(o.value),
                }));

                const currentValueString = bufferString ?? String(params.currentValue ?? "");
                const index = Math.max(
                    0,
                    options.findIndex((o) => o.value === currentValueString)
                );

                return (
                    <RenderEditorScreen
                        key="modal-editor"
                        fieldId={params.fieldKey}
                        label={params.fieldKey}
                        valueString={options[index]?.value ?? currentValueString}
                        editorType="select"
                        selectOptions={options}
                        selectIndex={index}
                        cliArguments={
                            canShowCli
                                ? {
                                      command: params.cliCommand!,
                                      onActivate: params.onCopyCliArguments!,
                                  }
                                : undefined
                        }
                        onChangeSelectIndex={(nextIndex) => {
                            const next = options[Math.max(0, Math.min(nextIndex, Math.max(0, options.length - 1)))];
                            setEditorBuffer({
                                fieldKey: params.fieldKey,
                                valueString: next ? next.value : "",
                            });
                        }}
                        onSubmit={() => {
                            const valueString =
                                editorBuffer?.fieldKey === params.fieldKey
                                    ? editorBuffer.valueString
                                    : String(params.currentValue ?? "");

                            const match = fieldConfig.options?.find((o) => String(o.value) === valueString);
                            params.onSubmit(match?.value ?? valueString);
                        }}
                        onCancel={() => {
                            navigation.closeModal();
                            setEditorBuffer(null);
                        }}
                    />
                );
            }

            if (fieldConfig?.type === "boolean") {
                const options = [
                    { label: "true", value: "true" },
                    { label: "false", value: "false" },
                ];

                const currentBool = bufferString !== undefined ? bufferString.trim().toLowerCase() === "true" : Boolean(params.currentValue);
                const index = currentBool ? 0 : 1;

                return (
                    <RenderEditorScreen
                        key="modal-editor"
                        fieldId={params.fieldKey}
                        label={params.fieldKey}
                        valueString={options[index]!.value}
                        editorType="select"
                        selectOptions={options}
                        selectIndex={index}
                        cliArguments={
                            canShowCli
                                ? {
                                      command: params.cliCommand!,
                                      onActivate: params.onCopyCliArguments!,
                                  }
                                : undefined
                        }
                        onChangeSelectIndex={(nextIndex) => {
                            const clamped = Math.max(0, Math.min(nextIndex, options.length - 1));
                            setEditorBuffer({
                                fieldKey: params.fieldKey,
                                valueString: options[clamped]!.value,
                            });
                        }}
                        onSubmit={() => {
                            const normalized = (bufferString ?? String(Boolean(params.currentValue))).trim().toLowerCase();
                            params.onSubmit(normalized === "true");
                        }}
                        onCancel={() => {
                            navigation.closeModal();
                            setEditorBuffer(null);
                        }}
                    />
                );
            }

            return (
                <RenderEditorScreen
                    key="modal-editor"
                    fieldId={params.fieldKey}
                    label={params.fieldKey}
                    valueString={bufferString ?? String(params.currentValue ?? "")}
                    editorType={fieldConfig?.type === "number" ? "number" : "text"}
                    cliArguments={
                        canShowCli
                            ? {
                                  command: params.cliCommand!,
                                  onActivate: params.onCopyCliArguments!,
                              }
                            : undefined
                    }
                    onChangeText={(text) => {
                        setEditorBuffer((current) => {
                            if (!current || current.fieldKey !== params.fieldKey) {
                                return { fieldKey: params.fieldKey, valueString: text };
                            }
                            return { ...current, valueString: text };
                        });
                    }}
                    onSubmit={() => {
                        const valueString =
                            editorBuffer?.fieldKey === params.fieldKey
                                ? editorBuffer.valueString
                                : String(params.currentValue ?? "");

                        if (!fieldConfig) {
                            params.onSubmit(valueString);
                            return;
                        }

                        if (fieldConfig.type === "number") {
                            const num = Number(valueString);
                            if (Number.isFinite(num)) {
                                params.onSubmit(num);
                            } else {
                                params.onSubmit(params.currentValue);
                            }
                            return;
                        }

                        params.onSubmit(valueString);
                    }}
                    onCancel={() => {
                        navigation.closeModal();
                        setEditorBuffer(null);
                    }}
                />
            );
        }

        return null;
    });

    return (
        <RenderAppShell
            app={{
                name,
                displayName,
                version,
                breadcrumb,
            }}
            status={{
                isExecuting: executor.isExecuting,
                message: statusMessage,
            }}
            screen={screenNode}
            modals={modalNodes.filter(Boolean) as React.ReactNode[]}
        />
    );
}

function getCommandsAtPath(commands: AnyCommand[], commandPath: string[]): AnyCommand[] {
    if (commandPath.length === 0) {
        return commands.filter((cmd) => cmd.supportsTui());
    }

    let current: AnyCommand[] = commands;
    for (const pathPart of commandPath) {
        const found = current.find((c) => c.name === pathPart);
        if (found?.subCommands) {
            current = found.subCommands.filter((sub) => sub.supportsTui());
        } else {
            break;
        }
    }

    return current;
}

function initializeConfigValues(appName: string, cmd: AnyCommand): Record<string, unknown> {
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

    const persisted = loadPersistedParameters(appName, cmd.name);
    return { ...defaults, ...persisted };
}

