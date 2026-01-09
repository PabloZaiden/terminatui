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
        description: "Configuration key to set",
        required: true,
        label: "Key",
        order: 1,
        group: "Required",
        placeholder: "e.g., name, email, theme",
    },
    value: {
        type: "string",
        description: "Value to set",
        required: true,
        label: "Value",
        order: 2,
        group: "Required",
        placeholder: "Enter value...",
    },
} as const satisfies OptionSchema;

export class UserSetCommand extends Command<typeof options> {
    readonly name = "set";
    readonly description = "Set a user configuration value";
    readonly options = options;

    override readonly actionLabel = "Set Value";

    override readonly examples = [
        { command: "config user set --key name --value 'Jane Doe'", description: "Set user name" },
        { command: "config user set --key theme --value light", description: "Set theme" },
    ];

    override async execute(ctx: AppContext, opts: OptionValues<typeof options>): Promise<CommandResult> {
        ctx.logger.info(`Setting user.${opts.key} = "${opts.value}"`);
        
        // Simulate setting the value
        await new Promise(resolve => setTimeout(resolve, 300));
        
        ctx.logger.info(`Successfully updated user configuration`);
        return {
            success: true,
            data: { key: opts.key, value: opts.value },
        };
    }

    override renderResult(result: CommandResult): string {
        if (!result.success) return result.message || "Error";
        const data = result.data as { key: string; value: string };
        return `✓ Set user.${data.key} = "${data.value}"`;
    }
}
