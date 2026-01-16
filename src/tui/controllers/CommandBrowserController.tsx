import type { AnyCommand } from "../../core/command.ts";
import type { NavigationAPI } from "../context/NavigationContext.tsx";

import { RenderCommandBrowserScreen } from "../semantic/render.tsx";
import { schemaToFieldConfigs } from "../utils/schemaToFields.ts";

import type { TuiRoute } from "../driver/types.ts";
import type { ConfigController } from "./ConfigController.tsx";

export class CommandBrowserController {
    #commands: AnyCommand[];
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
        const params = (this.#navigation.current.params ?? { commandPath: [] }) as { commandPath: string[] };
        const commandPath = params.commandPath ?? [];

        const currentCommands = getCommandsAtPath(this.#commands, commandPath);

        return {
            breadcrumb: commandPath,
            node: (
                <RenderCommandBrowserScreen
                    commandId={commandPath}
                    commands={currentCommands}
                    selectedCommandIndex={Math.min(this.#commandSelectedIndex, Math.max(0, currentCommands.length - 1))}
                    onOpenPath={(nextPath) => {
                        this.#commandSelectedIndex = 0;
                        this.#navigation.replace("commandBrowser" satisfies TuiRoute, { commandPath: nextPath });
                    }}
                    onSelectCommand={(index) => {
                        const nextIndex = Math.max(0, Math.min(index, Math.max(0, currentCommands.length - 1)));
                        this.#commandSelectedIndex = nextIndex;
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
