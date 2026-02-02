import type { AnyCommand } from "../../core/command.ts";
import type { NavigationAPI } from "../context/NavigationContext.tsx";

import { RenderCommandBrowserScreen } from "../semantic/render.tsx";
import { schemaToFieldConfigs } from "../utils/schemaToFields.ts";

import type { CommandBrowserRouteParams, TuiRoute } from "../driver/types.ts";
import type { ConfigController } from "./ConfigController.tsx";

export class CommandBrowserController {
    private commands: AnyCommand[];
    private configController: ConfigController;
    private navigation: NavigationAPI;

    private clampSelectedIndex(index: number, commands: AnyCommand[]): number {
        return Math.max(0, Math.min(index, Math.max(0, commands.length - 1)));
    }

    public constructor({
        commands,
        navigation,
        configController,
    }: {
        commands: AnyCommand[];
        navigation: NavigationAPI;
        configController: ConfigController;
    }) {
        this.commands = commands;
        this.navigation = navigation;
        this.configController = configController;
    }

    public render(): { node: React.ReactNode; breadcrumb: string[] } {
        const params = (this.navigation.current.params ?? { commandPath: [] }) as CommandBrowserRouteParams;
        const commandPath = params.commandPath ?? [];
        const selectedIndex = params.selectedIndex ?? 0;

        const currentCommands = this.getCommandsAtPath(commandPath);

        return {
            breadcrumb: commandPath,
            node: (
                <RenderCommandBrowserScreen
                    commandId={commandPath}
                    commands={currentCommands}
                    selectedCommandIndex={this.clampSelectedIndex(selectedIndex, currentCommands)}
                    onOpenPath={(nextPath) => {
                        this.navigation.replace("commandBrowser" satisfies TuiRoute, { commandPath: nextPath, selectedIndex: 0 });
                    }}
                    onSelectCommand={(index) => {
                        const clampedIndex = this.clampSelectedIndex(index, currentCommands);
                        this.navigation.replace("commandBrowser" satisfies TuiRoute, { commandPath, selectedIndex: clampedIndex });
                    }}
                    onRunSelected={() => {
                        const clampedIndex = this.clampSelectedIndex(selectedIndex, currentCommands);
                        const selected = currentCommands[clampedIndex];
                        if (!selected) {
                            return;
                        }

                        // If selected command has navigable subcommands, navigate to them instead of config
                        const navigableSubCommands = selected.subCommands?.filter((sub) => sub.supportsTui()) ?? [];
                        if (navigableSubCommands.length > 0) {
                            this.navigation.replace("commandBrowser" satisfies TuiRoute, { 
                                commandPath: [...commandPath, selected.name], 
                                selectedIndex: 0 
                            });
                            return;
                        }

                        this.navigation.push("config" satisfies TuiRoute, {
                            command: selected,
                            commandPath: [...commandPath, selected.name],
                            values: this.configController.initializeValues(selected),
                            fieldConfigs: schemaToFieldConfigs(selected.options),
                        });
                    }}
                />
            ),
        };
    }

    private getCommandsAtPath(commandPath: string[]): AnyCommand[] {
        if (commandPath.length === 0) {
            return this.commands.filter((cmd) => cmd.supportsTui());
        }

        let current: AnyCommand[] = this.commands;
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
}
