import { useState, useCallback, useMemo, useEffect } from "react";
import type { AnyCommand } from "../core/command.ts";
import { AppContext } from "../core/context.ts";
import type { OptionValues, OptionSchema, OptionDef } from "../types/command.ts";
import type { CustomField } from "./TuiApplication.tsx";
import { useClipboard } from "./hooks/useClipboard.ts";
import { KeyboardPriority, KeyboardProvider } from "./context/KeyboardContext.tsx";
import { useCommandExecutor } from "./hooks/useCommandExecutor.ts";
import { useKeyboardHandler } from "./hooks/useKeyboardHandler.ts";
import { CommandSelector } from "./components/CommandSelector.tsx";
import { ConfigForm } from "./components/ConfigForm.tsx";
import { ActionButton } from "./components/ActionButton.tsx";
import { ResultsPanel } from "./components/ResultsPanel.tsx";
import { getFieldDisplayValue, schemaToFieldConfigs } from "./utils/schemaToFields.ts";
import { buildCliCommand } from "./utils/buildCliCommand.ts";
import { loadPersistedParameters, savePersistedParameters } from "./utils/parameterPersistence.ts";
import { Header } from "./components/Header.tsx";
import { StatusBar } from "./components/StatusBar.tsx";
import { EditorModal } from "./components/EditorModal.tsx";
import { CliModal } from "./components/CliModal.tsx";
import { LogsModal } from "./components/LogsModal.tsx";
import { Theme } from "./theme.ts";
import type { LogEvent } from "../core/logger.ts";

/**
 * TUI application mode.
 */
enum Mode {
    CommandSelect,
    Config,
    Running,
    Results,
    Error,
}

/**
 * Focused section for keyboard navigation.
 */
enum FocusedSection {
    Config,
    Results,
    None,
}

interface TuiAppProps {
    /** Application name (CLI name) */
    name: string;
    /** Display name for TUI header (human-readable) */
    displayName?: string;
    /** Application version */
    version: string;
    /** Available commands */
    commands: AnyCommand[];
    /** Custom fields to add to the TUI form */
    customFields?: CustomField[];
    /** Called when user wants to exit */
    onExit: () => void;
}

/**
 * Main TUI application component.
 * Wraps content with KeyboardProvider.
 */
export function TuiApp(props: TuiAppProps) {
    return (
        <KeyboardProvider>
            <TuiAppContent {...props} />
        </KeyboardProvider>
    );
}

function TuiAppContent({
    name,
    displayName,
    version,
    commands,
    customFields,
    onExit
}: TuiAppProps) {
    // State
    const [mode, setMode] = useState<Mode>(Mode.CommandSelect);
    const [selectedCommand, setSelectedCommand] = useState<AnyCommand | null>(null);
    const [commandPath, setCommandPath] = useState<string[]>([]);
    const [commandSelectorIndex, setCommandSelectorIndex] = useState(0);
    const [selectorIndexStack, setSelectorIndexStack] = useState<number[]>([]);
    const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);
    const [editingField, setEditingField] = useState<string | null>(null);
    const [focusedSection, setFocusedSection] = useState<FocusedSection>(FocusedSection.Config);
    const [logsModalVisible, setLogsModalVisible] = useState(false);
    const [cliModalVisible, setCliModalVisible] = useState(false);
    const [configValues, setConfigValues] = useState<Record<string, unknown>>({});
    const [logHistory, setLogHistory] = useState<LogEvent[]>([]);

    // Register log event handler
    useEffect(() => {
        AppContext.current.logger.onLogEvent((event: LogEvent) => {
            setLogHistory((prev) => [...prev, event]);
        });
    }, []);

    // Hooks
    const { copyWithMessage, lastAction } = useClipboard();

    // Command executor
    const executeCommand = useCallback(async (cmd: AnyCommand, values: Record<string, unknown>, signal: AbortSignal) => {
        // If the command provides buildConfig, build and validate before executing
        let configOrValues: unknown = values;
        if (cmd.buildConfig) {
            configOrValues = await cmd.buildConfig(values as OptionValues<OptionSchema>);
        }

        return await cmd.execute(configOrValues as OptionValues<OptionSchema>, { signal });
    }, []);

    const { isExecuting, result, error, execute, cancel, reset: resetExecutor } = useCommandExecutor(
        (cmd: unknown, values: unknown, signal: unknown) => executeCommand(cmd as AnyCommand, values as Record<string, unknown>, signal as AbortSignal)
    );

    // Computed values
    const fieldConfigs = useMemo(() => {
        if (!selectedCommand) return [];
        const commandFields = schemaToFieldConfigs(selectedCommand.options);
        // Merge custom fields if provided
        if (customFields && customFields.length > 0) {
            return [...commandFields, ...customFields];
        }
        return commandFields;
    }, [selectedCommand, customFields]);

    const cliCommand = useMemo(() => {
        if (!selectedCommand) return "";
        return buildCliCommand(name, commandPath, selectedCommand.options, configValues as OptionValues<OptionSchema>);
    }, [name, commandPath, selectedCommand, configValues]);

    // Build breadcrumb with display names by traversing the command path
    const breadcrumb = useMemo(() => {
        if (commandPath.length === 0) return undefined;

        const displayNames: string[] = [];
        let current: AnyCommand[] = commands;

        for (const pathPart of commandPath) {
            const found = current.find((c) => c.name === pathPart);
            if (found) {
                displayNames.push(found.displayName ?? found.name);
                if (found.subCommands) {
                    current = found.subCommands;
                }
            } else {
                displayNames.push(pathPart);
            }
        }

        return displayNames;
    }, [commandPath, commands]);

    // Initialize config values when command changes
    const initializeConfigValues = useCallback((cmd: AnyCommand) => {
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
        // Initialize custom field defaults
        if (customFields) {
            for (const field of customFields) {
                if (field.default !== undefined) {
                    defaults[field.key] = field.default;
                }
            }
        }

        // Load persisted parameters and merge with defaults
        const persisted = loadPersistedParameters(name, cmd.name);
        const merged = { ...defaults, ...persisted };

        setConfigValues(merged);
    }, [customFields, name]);

    /**
     * Check if a command has navigable subcommands (excluding commands that don't support TUI).
     */
    const hasNavigableSubCommands = useCallback((cmd: AnyCommand): boolean => {
        if (!cmd.subCommands || cmd.subCommands.length === 0) return false;
        // Filter out commands that don't support TUI
        const navigable = cmd.subCommands.filter((sub) => sub.supportsTui());
        return navigable.length > 0;
    }, []);

    // Handlers
    const handleCommandSelect = useCallback((cmd: AnyCommand) => {
        // Check if command has navigable subcommands (container commands)
        if (hasNavigableSubCommands(cmd)) {
            // Push current selection index to stack before navigating
            setSelectorIndexStack((prev) => [...prev, commandSelectorIndex]);
            // Navigate into subcommands
            setCommandPath((prev) => [...prev, cmd.name]);
            setCommandSelectorIndex(0);
            return;
        }

        setSelectedCommand(cmd);
        setCommandPath((prev) => [...prev, cmd.name]);
        initializeConfigValues(cmd);
        setSelectedFieldIndex(0);
        setFocusedSection(FocusedSection.Config);
        setLogsModalVisible(false);

        // Check if command should execute immediately
        if (cmd.immediateExecution) {
            handleRunCommand(cmd);
        } else {
            setMode(Mode.Config);
        }
    }, [initializeConfigValues, hasNavigableSubCommands, commandSelectorIndex]);

    const handleBack = useCallback(() => {
        if (logsModalVisible) {
            setLogsModalVisible(false);
        } else if (mode === Mode.Running) {
            // Cancel the running command and go back
            cancel();
            // If command was immediate execution, go back to command select
            if (selectedCommand?.immediateExecution) {
                setMode(Mode.CommandSelect);
                setSelectedCommand(null);
                setCommandPath((prev) => prev.slice(0, -1));
                setSelectedFieldIndex(0);
                setFocusedSection(FocusedSection.Config);
            } else {
                setMode(Mode.Config);
                setFocusedSection(FocusedSection.Config);
            }
            resetExecutor();
        } else if (mode === Mode.Config) {
            setMode(Mode.CommandSelect);
            setSelectedCommand(null);
            setCommandPath((prev) => prev.slice(0, -1));
            setSelectedFieldIndex(0);
            setFocusedSection(FocusedSection.Config);
        } else if (mode === Mode.Results || mode === Mode.Error) {
            // If command was immediate execution, go back to command select
            if (selectedCommand?.immediateExecution) {
                setMode(Mode.CommandSelect);
                setSelectedCommand(null);
                setCommandPath((prev) => prev.slice(0, -1));
                setSelectedFieldIndex(0);
                setFocusedSection(FocusedSection.Config);
            } else {
                setMode(Mode.Config);
                setFocusedSection(FocusedSection.Config);
            }
            resetExecutor();
        } else if (mode === Mode.CommandSelect && commandPath.length > 0) {
            // Pop from selector index stack to restore previous selection
            const previousIndex = selectorIndexStack[selectorIndexStack.length - 1] ?? 0;
            setSelectorIndexStack((prev) => prev.slice(0, -1));
            setCommandSelectorIndex(previousIndex);
            setCommandPath((prev) => prev.slice(0, -1));
        } else {
            onExit();
        }
    }, [mode, logsModalVisible, commandPath, selectedCommand, selectorIndexStack, cancel, onExit, resetExecutor]);

    const handleRunCommand = useCallback(async (cmd?: AnyCommand) => {
        const cmdToRun = cmd ?? selectedCommand;
        if (!cmdToRun) return;

        // Save parameters before running
        savePersistedParameters(name, cmdToRun.name, configValues);

        // Set up for running
        setMode(Mode.Running);

        // Execute and wait for result
        const outcome = await execute(cmdToRun, configValues);

        // If cancelled, don't transition - handleBack already handled it
        if (outcome.cancelled) {
            return;
        }

        // Transition based on outcome
        if (outcome.success) {
            setMode(Mode.Results);
        } else {
            setMode(Mode.Error);
        }
        setFocusedSection(FocusedSection.Results);
    }, [selectedCommand, configValues, execute, name]);

    const handleEditField = useCallback((fieldKey: string) => {
        setEditingField(fieldKey);
    }, []);

    const handleFieldSubmit = useCallback((value: unknown) => {
        if (editingField) {
            setConfigValues((prev) => {
                let newValues = { ...prev, [editingField]: value };

                // Call command's onConfigChange if available
                if (selectedCommand?.onConfigChange) {
                    const updates = selectedCommand.onConfigChange(editingField, value, newValues);
                    if (updates) {
                        newValues = { ...newValues, ...updates };
                    }
                }

                // Call custom field onChange if applicable
                const customField = customFields?.find((f) => f.key === editingField);
                if (customField?.onChange) {
                    customField.onChange(value, newValues);
                }
                return newValues;
            });
        }
        setEditingField(null);
    }, [editingField, customFields, selectedCommand]);

    const handleCopy = useCallback((content: string, label: string) => {
        copyWithMessage(content, label);
    }, [copyWithMessage]);

    const getClipboardContent = useCallback((): { content: string; label: string } | null => {
        // If showing logs modal, copy logs
        if (logsModalVisible) {
            // In Logs mode, copy logs
            const logs = logHistory;
            return { content: logs.map(log => log.message).join("\n"), label: "Logs" };
        }

        // In Results/Error mode with results focused
        if ((mode === Mode.Results || mode === Mode.Error) && focusedSection === FocusedSection.Results) {
            if (error) {
                return { content: error.message, label: "Error" };
            }
            if (result) {
                // Use command's getClipboardContent if available
                if (selectedCommand?.getClipboardContent) {
                    const customContent = selectedCommand.getClipboardContent(result);
                    if (customContent) {
                        return { content: customContent, label: "Results" };
                    }
                }
                return { content: JSON.stringify(result.data ?? result, null, 2), label: "Results" };
            }
            return null;
        }

        // In Config mode with config focused, copy config JSON
        if (mode === Mode.Config && focusedSection === FocusedSection.Config) {
            return { content: JSON.stringify(configValues, null, 2), label: "Config" };
        }

        return null;
    }, [mode, focusedSection, error, result, configValues, selectedCommand, logHistory]);

    const cycleFocusedSection = useCallback(() => {
        const sections: FocusedSection[] = [];
        if (mode === Mode.Config) sections.push(FocusedSection.Config);
        if (mode === Mode.Results || mode === Mode.Error) sections.push(FocusedSection.Results);

        if (sections.length <= 1) return;

        const currentIdx = sections.indexOf(focusedSection);
        const nextIdx = (currentIdx + 1) % sections.length;
        setFocusedSection(sections[nextIdx]!);
    }, [mode, focusedSection]);

    // Global keyboard handler
    useKeyboardHandler(
        (event) => {
            const { key } = event;

            // Escape to go back
            if (key.name === "escape") {
                handleBack();
                event.stopPropagation();
                return;
            }

            // Y to copy content based on current mode and focus
            if ((key.name === "y")) {
                const clipboardData = getClipboardContent();
                if (clipboardData) {
                    handleCopy(clipboardData.content, clipboardData.label);
                }
                event.stopPropagation();
                return;
            }

            // Tab to cycle focus
            if (key.name === "tab") {
                cycleFocusedSection();
                event.stopPropagation();
                return;
            }

            // L to toggle logs
            if (key.name === "l" && !editingField) {
                setLogsModalVisible((prev) => {
                    const newState = !prev;
                    AppContext.current.logger.trace(`Logs ${newState ? "opened" : "closed"} via keyboard shortcut.`);
                    return newState;
                });
                event.stopPropagation();
                return;
            }

            // C to show CLI command
            if (key.name === "c" && !editingField && mode === Mode.Config) {
                setCliModalVisible(true);
                event.stopPropagation();
                return;
            }
        },
        KeyboardPriority.Global,
        { enabled: !editingField && !cliModalVisible }
    );

    // Get current commands for selector (excluding commands that don't support TUI)
    const currentCommands = useMemo(() => {
        if (commandPath.length === 0) {
            return commands.filter((cmd) => cmd.supportsTui());
        }

        // Navigate through the full path to find current level's subcommands
        let current: AnyCommand[] = commands;
        for (const pathPart of commandPath) {
            const found = current.find((c) => c.name === pathPart);
            if (found?.subCommands) {
                // Filter out commands that don't support TUI
                current = found.subCommands.filter((sub) => sub.supportsTui());
            } else {
                break; // Path invalid or command has no subcommands
            }
        }
        return current;
    }, [commands, commandPath]);

    // Status message
    const statusMessage = useMemo(() => {
        if (lastAction) return lastAction;
        if (isExecuting) return "Executing...";
        if (mode === Mode.Error) return "Error occurred. Press Esc to go back.";
        if (mode === Mode.Results) return "Run completed. Press Esc to return to config.";
        if (mode === Mode.CommandSelect) return "Select a command to get started.";
        if (mode === Mode.Config) {
            return `Ready. Select [${selectedCommand?.actionLabel ?? "Run"}] and press Enter.`;
        }
        return "";
    }, [lastAction, isExecuting, mode, selectedCommand]);

    const shortcuts = useMemo(() => {
        const parts: string[] = [];
        if (mode === Mode.Config) {
            parts.push("↑↓ Navigate", "Enter Edit", "Y Copy", "C CLI", "Esc Back");
        } else if (mode === Mode.Running) {
            parts.push("Y Copy", "Esc Cancel");
        } else if (mode === Mode.Results || mode === Mode.Error) {
            parts.push("Tab Focus", "Y Copy", "Esc Back");
        } else {
            parts.push("↑↓ Navigate", "Enter Select", "Esc Exit");
        }
        parts.push("L Logs");
        return parts.join(" • ");
    }, [mode]);

    // Get display value for fields
    const getDisplayValue = useCallback((key: string, value: unknown, _type: string) => {
        const fieldConfig = fieldConfigs.find((f) => f.key === key);
        if (fieldConfig) {
            return getFieldDisplayValue(value, fieldConfig);
        }
        return String(value ?? "");
    }, [fieldConfigs]);

    // Render the main content based on current mode
    const renderContent = () => {
        switch (mode) {
            case Mode.CommandSelect:
                return (
                    <CommandSelector
                        commands={currentCommands.map((cmd) => ({ command: cmd }))}
                        selectedIndex={commandSelectorIndex}
                        onSelectionChange={setCommandSelectorIndex}
                        onSelect={handleCommandSelect}
                        onExit={handleBack}
                        breadcrumb={breadcrumb}
                    />
                );

            case Mode.Config:
                if (!selectedCommand) return null;
                return (
                    <box flexDirection="column" flexGrow={1}>
                        <ConfigForm
                            title={`Configure: ${selectedCommand.displayName ?? selectedCommand.name}`}
                            fieldConfigs={fieldConfigs}
                            values={configValues}
                            selectedIndex={selectedFieldIndex}
                            focused={focusedSection === FocusedSection.Config}
                            onSelectionChange={setSelectedFieldIndex}
                            onEditField={handleEditField}
                            onAction={() => handleRunCommand()}
                            getDisplayValue={getDisplayValue}
                            actionButton={
                                <ActionButton
                                    label={selectedCommand.actionLabel ?? "Run"}
                                    isSelected={selectedFieldIndex === fieldConfigs.length}
                                />
                            }
                        />
                    </box>
                );

            case Mode.Running:
                return (
                    <box flexDirection="column" flexGrow={1}>
                        <text fg={Theme.statusText}>
                            Running... Check logs for progress.
                        </text>
                        <text fg={Theme.statusText}>
                            Press Esc to cancel.
                        </text>
                    </box>
                );

            case Mode.Results:
            case Mode.Error:
                return (
                    <box flexDirection="column" flexGrow={1} gap={1}>
                        <ResultsPanel
                            result={result}
                            error={error}
                            focused={focusedSection === FocusedSection.Results}
                            renderResult={selectedCommand?.renderResult}
                        />
                    </box>
                );

            default:
                return null;
        }
    };

    return (
        <box flexDirection="column" flexGrow={1} padding={1}>
            <Header name={displayName ?? name} version={version} breadcrumb={breadcrumb} />

            <box key={`content-${mode}-${isExecuting}`} flexDirection="column" flexGrow={1}>
                {renderContent()}
            </box>

            <StatusBar
                status={statusMessage}
                isRunning={isExecuting}
                shortcuts={shortcuts}
            />

            {/* Modals */}
            <EditorModal
                fieldKey={editingField}
                currentValue={editingField ? configValues[editingField] : undefined}
                visible={editingField !== null}
                onSubmit={handleFieldSubmit}
                onCancel={() => setEditingField(null)}
                fieldConfigs={fieldConfigs}
            />

            <CliModal
                command={cliCommand}
                visible={cliModalVisible}
                onClose={() => setCliModalVisible(false)}
                onCopy={handleCopy}
            />

            <LogsModal
                logs={logHistory}
                visible={logsModalVisible}
                onClose={() => setLogsModalVisible(false)}
                onCopy={handleCopy}
            />

        </box>
    );
}
