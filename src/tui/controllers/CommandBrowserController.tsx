import type { AnyCommand } from "../../core/command.ts";
import type { NavigationAPI } from "../context/NavigationContext.tsx";

import { RenderCommandBrowserScreen } from "../semantic/render.tsx";
import { schemaToFieldConfigs } from "../utils/schemaToFields.ts";

import type { CommandBrowserRouteParams, TuiRoute } from "../driver/types.ts";
import type { ConfigController } from "./ConfigController.tsx";

export class CommandBrowserController {
    #commands: AnyCommand[];

    private clampSelectedIndex(index: number, commands: AnyCommand[]): number {
        return Math.max(0, Math.min(index, Math.max(0, commands.length - 1)));
    }
    #configController: ConfigController;
    #navigation: NavigationAPI;
    #commandSelectedIndex = 0;

    public constructor({
        commands,
        navigation,
        configController,
    }: {
        commands: AnyCommand[];
        navigation: NavigationAPI;
        configController: ConfigController;
    }) {
        this.#commands = commands;
        this.#navigation = navigation;
        this.#configController = configController;
    }

    public render(): { node: React.ReactNode; breadcrumb: string[] } {
        const params = (this.#navigation.current.params ?? { commandPath: [] }) as CommandBrowserRouteParams;
        const commandPath = params.commandPath ?? [];

        const currentCommands = this.getCommandsAtPath(commandPath);

        return {
            breadcrumb: commandPath,
            node: (
                <RenderCommandBrowserScreen
                    commandId={commandPath}
                    commands={currentCommands}
                    selectedCommandIndex={this.clampSelectedIndex(this.#commandSelectedIndex, currentCommands)}
                    onOpenPath={(nextPath) => {
                        this.#commandSelectedIndex = 0;
                        this.#navigation.replace("commandBrowser" satisfies TuiRoute, { commandPath: nextPath });
                    }}
                    onSelectCommand={(index) => {
                        this.#commandSelectedIndex = this.clampSelectedIndex(index, currentCommands);
                    }}
                    onRunSelected={() => {
                        const selected = currentCommands[this.#commandSelectedIndex];
                        if (!selected) {
                            return;
                        }

                        this.#navigation.push("config" satisfies TuiRoute, {
                            command: selected,
                            commandPath,
                            values: this.#configController.initializeValues(selected),
                            fieldConfigs: schemaToFieldConfigs(selected.options),
                        });
                    }}
                />
            ),
        };
    }

    private getCommandsAtPath(commandPath: string[]): AnyCommand[] {
        if (commandPath.length === 0) {
            return this.#commands.filter((cmd) => cmd.supportsTui());
        }

        let current: AnyCommand[] = this.#commands;
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
