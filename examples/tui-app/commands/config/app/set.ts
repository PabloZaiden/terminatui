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
        description: "Application configuration key to set",
        required: true,
        label: "Key",
        order: 1,
        group: "Required",
        placeholder: "e.g., port, debug, logLevel",
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
    type: {
        type: "string",
        description: "Value type for parsing",
        enum: ["string", "number", "boolean"] as const,
        default: "string",
        label: "Value Type",
        order: 3,
        group: "Options",
    },
} as const satisfies OptionSchema;

export class AppSetCommand extends Command<typeof options> {
    readonly name = "set";
    override displayName = "Set App Config";
    readonly description = "Set an application configuration value";
    readonly options = options;

    override readonly actionLabel = "Set Value";

    override readonly examples = [
        { command: "config app set --key port --value 8080 --type number", description: "Set app port" },
        { command: "config app set --key debug --value false --type boolean", description: "Disable debug" },
    ];

    override async execute(ctx: AppContext, opts: OptionValues<typeof options>): Promise<CommandResult> {
        let parsedValue: string | number | boolean = opts.value;
        
        // Parse value based on type
        if (opts.type === "number") {
            parsedValue = Number(opts.value);
            if (isNaN(parsedValue)) {
                ctx.logger.error(`Invalid number value: "${opts.value}"`);
                return {
                    success: false,
                    message: `Invalid number: "${opts.value}"`,
                };
            }
        } else if (opts.type === "boolean") {
            parsedValue = opts.value.toLowerCase() === "true";
        }

        ctx.logger.info(`Setting app.${opts.key} = ${JSON.stringify(parsedValue)}`);
        
        // Simulate setting the value
        await new Promise(resolve => setTimeout(resolve, 300));
        
        ctx.logger.info(`Successfully updated application configuration`);
        return {
            success: true,
            data: { key: opts.key, value: parsedValue, type: opts.type },
        };
    }

    override renderResult(result: CommandResult): string {
        if (!result.success) return result.message || "Error";
        const data = result.data as { key: string; value: string | number | boolean; type: string };
        return `✓ Set app.${data.key} = ${JSON.stringify(data.value)} (${data.type})`;
    }
}
