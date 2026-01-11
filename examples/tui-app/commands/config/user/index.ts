import { Command, type CommandResult } from "../../../../../src/core/command.ts";
import type { AppContext } from "../../../../../src/core/context.ts";
import { UserGetCommand } from "./get.ts";
import { UserSetCommand } from "./set.ts";

export class UserConfigCommand extends Command {
    readonly name = "user";
    override displayName = "User Settings";
    readonly description = "Manage user configuration";
    readonly options = {};

    override readonly subCommands = [
        new UserGetCommand(),
        new UserSetCommand(),
    ];

    override execute(_ctx: AppContext): CommandResult {
        console.log("Use 'config user <command>' for user configuration.");
        console.log("Available: get, set");
        return { success: true };
    }
}

export { UserGetCommand, UserSetCommand };
