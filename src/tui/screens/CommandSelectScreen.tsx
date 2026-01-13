import { useState, useMemo, useCallback } from "react";
import type { AnyCommand } from "../../core/command.ts";
import { CommandSelector } from "../components/CommandSelector.tsx";
import { useTuiApp } from "../context/TuiAppContext.tsx";
import { useNavigation } from "../context/NavigationContext.tsx";
import { useBackHandler } from "../hooks/useBackHandler.ts";
import type { ScreenComponent } from "../registry.tsx";
import { loadPersistedParameters } from "../utils/parameterPersistence.ts";
import { schemaToFieldConfigs } from "../utils/schemaToFields.ts";
import type { OptionDef, OptionSchema } from "../../types/command.ts";
import { ScreenBase } from "./ScreenBase.ts";
import { type ConfigParams, ConfigScreen } from "./ConfigScreen.tsx";

/**
 * Screen state stored in navigation params.
 */
export interface CommandSelectParams {
    commandPath: string[];
}

/**
 * Command selection screen.
 * Fully self-contained - gets all data from context and handles its own transitions.
 */
export class CommandSelectScreen extends ScreenBase {
    static readonly Id = "command-select";

    getRoute(): string {
        return CommandSelectScreen.Id;
    }

    override component(): ScreenComponent {
        return function CommandSelectScreenComponent() {
            const { name, commands } = useTuiApp();
            const navigation = useNavigation();
            
            // Get params from navigation, with defaults
            const params = (navigation.current.params ?? { commandPath: [] }) as CommandSelectParams;
            const commandPath = params.commandPath ?? [];
            
            // Local selection state
            const [selectedIndex, setSelectedIndex] = useState(0);

            // Get current commands based on path
            const currentCommands = useMemo<AnyCommand[]>(() => {
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
            }, [commands, commandPath]);

            // Build breadcrumb from path
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

            const items = currentCommands.map((cmd) => ({
                command: cmd,
                label: cmd.displayName ?? cmd.name,
                description: cmd.description,
            }));

            // Handle command selection - this screen decides where to go next
            const handleSelect = useCallback((cmd: AnyCommand) => {
                // If command has runnable subcommands, navigate deeper
                if (cmd.subCommands && cmd.subCommands.some((c) => c.supportsTui())) {
                    navigation.replace<CommandSelectParams>(CommandSelectScreen.Id, { commandPath: [...commandPath, cmd.name] });
                    return;
                }

                // Otherwise, push to config screen
                navigation.push<ConfigParams>(ConfigScreen.Id, {
                    command: cmd,
                    commandPath: [...commandPath, cmd.name],
                    values: initializeConfigValues(name, cmd),
                    fieldConfigs: schemaToFieldConfigs(cmd.options),
                });
            }, [navigation, commandPath, name]);

            // Register back handler - this screen decides what back means
            useBackHandler(useCallback(() => {
                if (commandPath.length > 0) {
                    // Go up one level
                    navigation.replace<CommandSelectParams>(CommandSelectScreen.Id, { commandPath: commandPath.slice(0, -1) });
                    return true; // We handled it
                }
                // At root - let navigation call onExit
                return false;
            }, [navigation, commandPath]));

            return (
                <CommandSelector
                    commands={items}
                    selectedIndex={selectedIndex}
                    onSelectionChange={setSelectedIndex}
                    onSelect={handleSelect}
                    breadcrumb={breadcrumb}
                />
            );
        };
    }
}

/**
 * Initialize config values from defaults and persisted values.
 */
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
