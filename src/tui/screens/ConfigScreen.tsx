import { useCallback, useMemo, useState } from "react";
import type { AnyCommand } from "../../core/command.ts";
import type { FieldConfig } from "../components/types.ts";
import { ConfigForm } from "../components/ConfigForm.tsx";
import { MenuButton } from "../semantic/MenuButton.tsx";
import { schemaToFieldConfigs } from "../utils/schemaToFields.ts";
import { useClipboardProvider } from "../hooks/useClipboardProvider.ts";
import { buildCliCommand } from "../utils/buildCliCommand.ts";
import { useTuiApp } from "../context/TuiAppContext.tsx";
import { useNavigation } from "../context/NavigationContext.tsx";
import { useExecutor } from "../context/ExecutorContext.tsx";
import type { ScreenComponent } from "../registry.tsx";
import { savePersistedParameters } from "../utils/parameterPersistence.ts";
import type { OptionSchema, OptionValues } from "../../types/command.ts";
import { ScreenBase } from "./ScreenBase.ts";
import type { EditorModalParams } from "../components/EditorModal.tsx";
import type { CliModalParams } from "../components/CliModal.tsx";
import { RunningScreen, type RunningParams } from "./RunningScreen.tsx";
import { type ErrorParams, ErrorScreen } from "./ErrorScreen.tsx";
import { type ResultsParams, ResultsScreen } from "./ResultsScreen.tsx";

/**
 * Screen state stored in navigation params.
 */
export interface ConfigParams {
    command: AnyCommand;
    commandPath: string[];
    values: Record<string, unknown>;
    fieldConfigs: FieldConfig[];
}

/**
 * Config screen for editing command options before execution.
 * Fully self-contained - gets all data from context and handles its own transitions.
 */
export class ConfigScreen extends ScreenBase {
    static readonly Id = "config";
    getRoute(): string {
        return ConfigScreen.Id;
    }

    override component(): ScreenComponent {
        return function ConfigScreenComponent() {
            const { name: appName } = useTuiApp();
            const navigation = useNavigation();
            const executor = useExecutor();
            
            // Get params from navigation
            const params = navigation.current.params as ConfigParams | undefined;
            if (!params) return null;
            
            const { command, commandPath, values, fieldConfigs } = params;
            
            // Local selection state for the form
            const [selectedFieldIndex, setSelectedFieldIndex] = useState(0);

            // Derive field configs (in case they weren't passed)
            const derivedFieldConfigs = useMemo(
                () => fieldConfigs ?? schemaToFieldConfigs(command.options),
                [fieldConfigs, command.options]
            );

            // Register clipboard provider for this screen
            useClipboardProvider(
                useCallback(() => ({
                    content: JSON.stringify(values, null, 2),
                    label: "Config",
                }), [values])
            );

            // Handle running the command
            const handleRun = useCallback(async () => {
                // Save parameters for next time
                savePersistedParameters(appName, command.name, values);
                
                // Push to running screen
                navigation.push<RunningParams>(RunningScreen.Id, {
                    command,
                    commandPath,
                    values,
                });
                
                // Execute the command
                const outcome = await executor.execute(command, values);
                
                if (outcome.cancelled) {
                    // If cancelled, pop back to config
                    navigation.pop();
                    return;
                }
                
                if (outcome.success) {
                    // Replace running with results
                    navigation.replace<ResultsParams>(ResultsScreen.Id, {
                        command,
                        commandPath,
                        values,
                        result: outcome.result ?? null,
                    });
                } else {
                    // Replace running with error
                    navigation.replace<ErrorParams>(ErrorScreen.Id, {
                        command,
                        commandPath,
                        values,
                        error: outcome.error ?? new Error("Unknown error"),
                    });
                }
            }, [appName, command, commandPath, values, navigation, executor]);

            // Handle editing a field - open property editor modal
            const handleEditField = useCallback((fieldKey: string) => {
                navigation.openModal<EditorModalParams>("property-editor", {
                    fieldKey,
                    currentValue: values[fieldKey],
                    fieldConfigs: derivedFieldConfigs,
                    onSubmit: (value: unknown) => {
                        const nextValues = { ...values, [fieldKey]: value };
                        navigation.replace<ConfigParams>(ConfigScreen.Id, { ...params, values: nextValues });
                        navigation.closeModal();
                    },
                    onCancel: () => navigation.closeModal(),
                });
            }, [navigation, values, derivedFieldConfigs, params]);

            // Handle opening the CLI Args modal
            const handleShowCliArgs = useCallback(() => {
                const cli = buildCliCommand(appName, commandPath, command.options, values as OptionValues<OptionSchema>);
                navigation.openModal<CliModalParams>("cli", { command: cli });
            }, [appName, commandPath, command.options, values, navigation]);

            return (
                <box flexDirection="column" flexGrow={1}>
                    <ConfigForm
                        title={`Configure: ${command.displayName ?? command.name}`}
                        fieldConfigs={derivedFieldConfigs}
                        values={values}
                        selectedIndex={selectedFieldIndex}
                        focused={true}
                        onSelectionChange={setSelectedFieldIndex}
                        onEditField={handleEditField}
                        onAction={handleRun}
                        additionalButtons={[
                            { label: "CLI Command", onPress: handleShowCliArgs },
                        ]}
                        actionButton={
                            <MenuButton
                                label={command.actionLabel ?? "Run"}
                                selected={selectedFieldIndex === derivedFieldConfigs.length + 1}
                            />
                        }
                    />
                </box>
            );
        };
    }
}
