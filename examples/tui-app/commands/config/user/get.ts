import { 
    Command, 
    type AppContext, 
    type OptionSchema, 
    type OptionValues,
    type CommandResult 
} from "../../../../../src/index.ts";

const options = {
    key: {
        type: "string",
        description: "Configuration key to get",
        required: true,
        label: "Key",
        order: 1,
        group: "Required",
        placeholder: "e.g., name, email, theme",
    },
} as const satisfies OptionSchema;

export class UserGetCommand extends Command<typeof options> {
    readonly name = "get";
    readonly description = "Get a user configuration value";
    readonly options = options;

    override readonly actionLabel = "Get Value";

    override readonly examples = [
        { command: "config user get --key name", description: "Get user name" },
        { command: "config user get --key email", description: "Get user email" },
    ];

    override async execute(ctx: AppContext, opts: OptionValues<typeof options>): Promise<CommandResult> {
        // Simulated user config store
        const userConfig: Record<string, string> = {
            name: "John Doe",
            email: "john@example.com",
            theme: "dark",
            language: "en",
        };

        const value = userConfig[opts.key];
        
        if (value === undefined) {
            ctx.logger.warn(`Key "${opts.key}" not found in user configuration`);
            return {
                success: false,
                message: `Key "${opts.key}" not found`,
            };
        }

        ctx.logger.info(`Retrieved user.${opts.key} = ${value}`);
        return {
            success: true,
            data: { key: opts.key, value },
        };
    }

    override renderResult(result: CommandResult): string {
        if (!result.success) return result.message || "Error";
        const data = result.data as { key: string; value: string };
        return `user.${data.key} = "${data.value}"`;
    }
}
