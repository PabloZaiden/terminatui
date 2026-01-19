import { UserConfigCommand } from "./user/index.ts";
import { AppConfigCommand } from "./app/index.ts";
import { Command } from "../../../../src/core/command.ts";

export class ConfigCommand extends Command {
    readonly name = "config";
    override displayName = "Config";
    readonly description = "Manage configuration (user and app settings)";
    readonly options = {};

    override readonly subCommands = [
        new UserConfigCommand(),
        new AppConfigCommand(),
    ];

    override readonly examples = [
        { command: "config user get --key name", description: "Get user name" },
        { command: "config user set --key theme --value dark", description: "Set user theme" },
        { command: "config app get --key port", description: "Get app port" },
        { command: "config app set --key debug --value true --type boolean", description: "Enable debug mode" },
    ];
}
