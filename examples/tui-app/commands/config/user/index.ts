import { Command } from "../../../../../src/core/command.ts";
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
}

export { UserGetCommand, UserSetCommand };
