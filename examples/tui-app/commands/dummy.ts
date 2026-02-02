import { Command, type CommandResult, type OptionSchema } from "@pablozaiden/terminatui";

export class DummyCommand extends Command {
    readonly name = "dummy";
    override displayName = "Dummy";
    readonly description = "A simple command that returns hello world";
    readonly options = {} as const satisfies OptionSchema;

    override async execute(): Promise<CommandResult> {
        return {
            success: true,
            data: { message: "Hello, World!" },
            message: "Hello, World!",
        };
    }
}
