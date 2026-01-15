import type { ReactNode } from "react";
import { Command, type CommandResult } from "../../../src/core/command";
import { AppContext } from "../../../src/core/context";
import type { OptionSchema, OptionValues } from "../../../src/types/command";
import { JsonHighlight } from "../../../src/tui/components/JsonHighlight.tsx";

const greetOptions = {
    name: {
        type: "string",
        description: "Name to greet",
        required: true,
        label: "Name",
        order: 1,
        group: "Required",
        placeholder: "Enter name...",
    },
    loud: {
        type: "boolean",
        description: "Use uppercase",
        alias: "l",
        default: true,
        label: "Loud Mode",
        order: 2,
        group: "Options",
    },
    times: {
        type: "number",
        description: "Number of times to greet",
        default: 1,
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
        { command: "greet --name World --loud --times 3", description: "Loud greeting 3 times" },
    ];

    override async execute(opts: OptionValues<typeof greetOptions>): Promise<CommandResult> {
        const greeting = this.createGreeting(opts);
        AppContext.current.logger.trace(greeting);
        return {
            success: true,
            data: { greeting, timestamp: new Date().toISOString(), meta: { loud: opts.loud, times: opts.times } },
            message: greeting,
        };
    }

    override renderResult(result: CommandResult): ReactNode {
        return JsonHighlight({ value: result.data });
    }

    override getClipboardContent(result: CommandResult): string | undefined {
        const data = result.data as { greeting?: string } | undefined;
        return data?.greeting;
    }

    private createGreeting(opts: OptionValues<typeof greetOptions>): string {
        const name = opts.name as string;
        const loud = opts.loud as boolean;
        const times = (opts.times as number) || 1;

        let message = `Hello, ${name}!`;
        if (loud) message = message.toUpperCase();

        return Array(times).fill(message).join("\n");
    }
}
