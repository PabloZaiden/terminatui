import { test, expect, describe } from "bun:test";
import { CommandRegistry } from "../core/registry.ts";
import { Command, type CommandResult } from "../core/command.ts";
import type { OptionSchema } from "../types/command.ts";

class SimpleCommand extends Command<OptionSchema> {
  readonly name: string;
  readonly description: string;
  readonly options = {} as const;

  constructor(name: string, description = "") {
    super();
    this.name = name;
    this.description = description;
  }

  override async execute(): Promise<CommandResult> {
    return { success: true };
  }
}

describe("CommandRegistry", () => {
  test("registers a command", () => {
    const registry = new CommandRegistry();
    registry.register(new SimpleCommand("test", "Test command"));
    expect(registry.has("test")).toBe(true);
  });

  test("retrieves command by name", () => {
    const registry = new CommandRegistry();
    const cmd = new SimpleCommand("greet", "Greet command");
    registry.register(cmd);
    expect(registry.get("greet")).toBe(cmd);
  });

  test("returns undefined for unknown command", () => {
    const registry = new CommandRegistry();
    expect(registry.get("unknown")).toBeUndefined();
  });

  test("lists all commands", () => {
    const registry = new CommandRegistry();
    const cmd1 = new SimpleCommand("a", "A");
    const cmd2 = new SimpleCommand("b", "B");

    registry.register(cmd1);
    registry.register(cmd2);

    const commands = registry.list();
    expect(commands).toContain(cmd1);
    expect(commands).toContain(cmd2);
  });

  test("throws on duplicate registration", () => {
    const registry = new CommandRegistry();
    const cmd = new SimpleCommand("dup", "Duplicate");
    registry.register(cmd);
    expect(() => registry.register(cmd)).toThrow(/already registered/i);
  });

  test("names returns command names", () => {
    const registry = new CommandRegistry();
    registry.register(new SimpleCommand("a", "A"));
    registry.register(new SimpleCommand("b", "B"));

    const names = registry.names();
    expect(names).toContain("a");
    expect(names).toContain("b");
  });
});
