import { test, expect, describe } from "bun:test";
import { Command } from "../core/command.ts";
import type { OptionSchema, OptionValues } from "../types/command.ts";

const testOptions = {
  verbose: {
    type: "boolean",
    description: "Enable verbose output",
    alias: "v",
  },
  name: {
    type: "string",
    description: "Name option",
  },
} as const satisfies OptionSchema;

describe("Command (class-based)", () => {
  test("has name and description", () => {
    class TestCommand extends Command<typeof testOptions> {
      readonly name = "test";
      readonly description = "A test command";
      readonly options = testOptions;

      override async execute(): Promise<void> {}
    }

    const cmd = new TestCommand();
    expect(cmd.name).toBe("test");
    expect(cmd.description).toBe("A test command");
  });

  test("has options", () => {
    class TestCommand extends Command<typeof testOptions> {
      readonly name = "test";
      readonly description = "A test command";
      readonly options = testOptions;

      override async execute(): Promise<void> {}
    }

    const cmd = new TestCommand();
    expect(cmd.options["verbose"]?.type).toBe("boolean");
  });

  test("supports subcommands", () => {
    class SubCommand extends Command<OptionSchema> {
      readonly name = "sub";
      readonly description = "A subcommand";
      readonly options = {} as const;

      override async execute(): Promise<void> {}
    }

    class ParentCommand extends Command<OptionSchema> {
      readonly name = "parent";
      readonly description = "A parent command";
      readonly options = {} as const;
      override subCommands = [new SubCommand()];

      override async execute(): Promise<void> {}
    }

    const cmd = new ParentCommand();
    expect(cmd.getSubCommand("sub")?.name).toBe("sub");
  });

  test("executes command", async () => {
    class ExecCommand extends Command<typeof testOptions> {
      readonly name = "exec";
      readonly description = "Exec command";
      readonly options = testOptions;

      executedWith: OptionValues<typeof testOptions> | null = null;

      override async execute(opts: OptionValues<typeof testOptions>): Promise<void> {
        this.executedWith = opts;
      }
    }

    const cmd = new ExecCommand();
    await cmd.execute({ verbose: true, name: "world" });
    expect(cmd.executedWith).toEqual({ verbose: true, name: "world" });
  });

  test("beforeExecute/afterExecute hooks are callable", () => {
    const order: string[] = [];

    class HookCommand extends Command<OptionSchema> {
      readonly name = "hook";
      readonly description = "Hook command";
      readonly options = {} as const;

      override beforeExecute(): void {
        order.push("before");
      }

      override execute(): void {
        order.push("execute");
      }

      override afterExecute(): void {
        order.push("after");
      }
    }

    const cmd = new HookCommand();
    cmd.beforeExecute();
    cmd.execute();
    cmd.afterExecute();

    expect(order).toEqual(["before", "execute", "after"]);
  });

  test("supports tuiHidden", () => {
    class HiddenCommand extends Command<OptionSchema> {
      readonly name = "hidden";
      readonly description = "Hidden";
      readonly options = {} as const;
      override readonly tuiHidden = true;

      override async execute(): Promise<void> {}
    }

    expect(new HiddenCommand().tuiHidden).toBe(true);
  });
});
