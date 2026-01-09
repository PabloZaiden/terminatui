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
        description: "Application configuration key to get",
        required: true,
        label: "Key",
        order: 1,
        group: "Required",
        placeholder: "e.g., port, debug, logLevel",
    },
} as const satisfies OptionSchema;

export class AppGetCommand extends Command<typeof options> {
    readonly name = "get";
    readonly description = "Get an application configuration value";
    readonly options = options;

    override readonly actionLabel = "Get Value";

    override readonly examples = [
        { command: "config app get --key port", description: "Get app port" },
        { command: "config app get --key logLevel", description: "Get log level" },
    ];

    override async execute(ctx: AppContext, opts: OptionValues<typeof options>): Promise<CommandResult> {
        // Simulated app config store
        const appConfig: Record<string, string | number | boolean> = {
            port: 3000,
            debug: true,
            logLevel: "info",
            maxConnections: 100,
            timeout: 30000,
        };

        const value = appConfig[opts.key];
        
        if (value === undefined) {
            ctx.logger.warn(`Key "${opts.key}" not found in application configuration`);
            return {
                success: false,
                message: `Key "${opts.key}" not found`,
            };
        }

        ctx.logger.info(`Retrieved app.${opts.key} = ${value}`);
        return {
            success: true,
            data: { key: opts.key, value },
        };
    }

    override renderResult(result: CommandResult): string {
        if (!result.success) return result.message || "Error";
        const data = result.data as { key: string; value: string | number | boolean };
        return `app.${data.key} = ${JSON.stringify(data.value)}`;
    }
}
