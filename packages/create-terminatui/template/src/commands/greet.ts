import {
    Command,
    type CommandResult,
    type CommandExecutionContext,
    type OptionSchema,
    type OptionValues,
    AppContext,
} from "@pablozaiden/terminatui";

const greetOptions = {
    name: {
        type: "string",
        description: "Name to greet",
        required: true,
        label: "Name",
        order: 1,
        group: "Required",
        placeholder: "Enter a name...",
    },
    loud: {
        type: "boolean",
        description: "Use uppercase for the greeting",
        alias: "l",
        default: false,
        label: "Loud Mode",
        order: 2,
        group: "Options",
    },
    times: {
        type: "number",
        description: "Number of times to repeat the greeting",
        default: 1,
        min: 1,
        max: 10,
        label: "Repeat Count",
        order: 3,
        group: "Options",
    },
} as const satisfies OptionSchema;

export class GreetCommand extends Command<typeof greetOptions> {
    readonly name = "greet";
    override displayName = "Greet";
    readonly description = "Greet someone with a friendly message";
    readonly options = greetOptions;

    override readonly actionLabel = "Say Hello";

    override readonly examples = [
        { command: "greet --name World", description: "Simple greeting" },
        { command: "greet --name World --loud", description: "Loud greeting" },
        { command: "greet --name World --times 3", description: "Repeat 3 times" },
    ];

    override async execute(
        opts: OptionValues<typeof greetOptions>,
        _execCtx: CommandExecutionContext
    ): Promise<CommandResult> {
        const name = opts.name as string;
        const loud = opts.loud as boolean;
        const times = (opts.times as number) || 1;

        let message = `Hello, ${name}!`;
        if (loud) message = message.toUpperCase();

        const greeting = Array(times).fill(message).join("\n");

        AppContext.current.logger.trace(`Message content: ${greeting}`);

        return {
            success: true,
            data: { greeting, name, loud, times },
            message: greeting,
        };
    }

    override getClipboardContent(result: CommandResult): string | undefined {
        const data = result.data as { greeting?: string } | undefined;
        return data?.greeting;
    }
}
