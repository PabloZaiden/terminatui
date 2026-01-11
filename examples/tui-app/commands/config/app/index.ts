import { Command, type CommandResult } from "../../../../../src/core/command.ts";
import type { AppContext } from "../../../../../src/core/context.ts";
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

    override execute(_ctx: AppContext): CommandResult {
        console.log("Use 'config app <command>' for application configuration.");
        console.log("Available: get, set");
        return { success: true };
    }
}

export { AppGetCommand, AppSetCommand };
