import { 
    Command, 
    type AppContext,
    type CommandResult 
} from "../../../../src/index.ts";
import { UserConfigCommand } from "./user/index.ts";
import { AppConfigCommand } from "./app/index.ts";

export class ConfigCommand extends Command {
    readonly name = "Config";
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

    override execute(_ctx: AppContext): CommandResult {
        console.log("Use 'config <category> <command>' to manage settings.");
        console.log("Categories: user, app");
        return { success: true };
    }
}
