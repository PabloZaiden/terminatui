import { Command } from "@pablozaiden/terminatui";
import { AppGetCommand } from "./get.ts";
import { AppSetCommand } from "./set.ts";

export class AppConfigCommand extends Command {
    readonly name = "app";
    override displayName = "App Settings";
    readonly description = "Manage application configuration";
    readonly options = {};

    override readonly subCommands = [
        new AppGetCommand(),
        new AppSetCommand(),
    ];
}

export { AppGetCommand, AppSetCommand };
