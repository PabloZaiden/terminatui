import { describe, expect, test } from "bun:test";
import {
  formatExamples,
  formatOptionSchema,
  formatOptions,
  formatSubCommands,
  formatUsage,
  generateAppHelp,
  generateCommandHelp,
} from "../core/help.ts";
import { Command } from "../core/command.ts";
import type { OptionSchema } from "../types/command.ts";

class SimpleCommand extends Command<OptionSchema> {
  readonly name: string;
  readonly description: string;
  readonly options: OptionSchema;

  constructor(config: { name: string; description: string; options?: OptionSchema }) {
    super();
    this.name = config.name;
    this.description = config.description;
    this.options = config.options ?? {};
  }

  override async execute(): Promise<void> {}
}

describe("Help Generation (core)", () => {
  describe("formatUsage", () => {
    test("formats basic usage and includes tokens", () => {
      const cmd = new SimpleCommand({
        name: "parent",
        description: "Parent",
        options: { verbose: { type: "boolean", description: "Verbose" } },
      });
      cmd.subCommands = [new SimpleCommand({ name: "child", description: "Child" })];

      const usage = formatUsage(cmd, { appName: "myapp" });
      expect(usage).toContain("myapp");
      expect(usage).toContain("parent");
      expect(usage).toContain("[command]");
      expect(usage).toContain("[options]");
    });
  });

  describe("formatSubCommands", () => {
    test("formats subcommands list", () => {
      const cmd = new SimpleCommand({ name: "parent", description: "Parent" });
      cmd.subCommands = [new SimpleCommand({ name: "child", description: "Child command" })];

      const commands = formatSubCommands(cmd);
      expect(commands).toContain("child");
      expect(commands).toContain("Child command");
    });

    test("returns empty for no subcommands", () => {
      const cmd = new SimpleCommand({ name: "test", description: "Test" });
      const commands = formatSubCommands(cmd);
      expect(commands).toBe("");
    });
  });

  describe("formatOptions", () => {
    test("formats options with descriptions", () => {
      const cmd = new SimpleCommand({
        name: "test",
        description: "Test",
        options: { verbose: { type: "boolean", description: "Enable verbose" } },
      });

      const options = formatOptions(cmd);
      expect(options).toContain("--verbose");
      expect(options).toContain("Enable verbose");
    });

    test("shows option aliases", () => {
      const cmd = new SimpleCommand({
        name: "test",
        description: "Test",
        options: { verbose: { type: "boolean", alias: "v", description: "Verbose" } },
      });

      const options = formatOptions(cmd);
      expect(options).toContain("-v");
    });

    test("shows default values", () => {
      const cmd = new SimpleCommand({
        name: "test",
        description: "Test",
        options: { count: { type: "number", default: 10, description: "Count" } },
      });

      const options = formatOptions(cmd);
      expect(options).toContain("10");
    });

    test("shows required marker", () => {
      const cmd = new SimpleCommand({
        name: "test",
        description: "Test",
        options: { name: { type: "string", required: true, description: "Name" } },
      });

      const options = formatOptions(cmd);
      expect(options).toContain("required");
    });

    test("shows enum values", () => {
      const cmd = new SimpleCommand({
        name: "test",
        description: "Test",
        options: {
          level: {
            type: "string",
            enum: ["low", "high"],
            description: "Level",
          },
        },
      });

      const options = formatOptions(cmd);
      expect(options).toContain("low");
      expect(options).toContain("high");
    });

    test("returns empty for no options", () => {
      const cmd = new SimpleCommand({ name: "test", description: "Test" });
      const options = formatOptions(cmd);
      expect(options).toBe("");
    });
  });

  describe("formatExamples", () => {
    test("formats examples list and empty state", () => {
      const cmd = new SimpleCommand({ name: "test", description: "Test" });
      cmd.examples = [{ command: "test --verbose", description: "Run with verbose" }];

      expect(formatExamples(cmd)).toContain("test --verbose");
      expect(formatExamples(cmd)).toContain("Run with verbose");

      const noExamples = new SimpleCommand({ name: "empty", description: "Empty" });
      expect(formatExamples(noExamples)).toBe("");
    });
  });

  describe("generateCommandHelp", () => {
    test("includes usage, description, and options section", () => {
      const cmd = new SimpleCommand({
        name: "test",
        description: "A test command for testing",
        options: { verbose: { type: "boolean", description: "Verbose mode" } },
      });

      const help = generateCommandHelp(cmd, { appName: "myapp" });
      expect(help).toContain("Usage:");
      expect(help).toContain("A test command for testing");
      expect(help).toContain("Options:");
      expect(help).toContain("--verbose");
      expect(help).toContain("--verbose, --no-verbose");
    });
  });

  describe("generateAppHelp", () => {
    test("generates root help with commands", () => {
      const commands = [new SimpleCommand({ name: "run", description: "Run something" })];
      const help = generateAppHelp(commands, { appName: "myapp" });
      expect(help).toContain("Commands:");
      expect(help).toContain("run");
    });
  });

  describe("Global Options section", () => {
    test("renders via schema and includes interactive + renderer", () => {
      const global = formatOptionSchema("Global Options", {
        "log-level": { type: "string", description: "Minimum log level" },
        interactive: { type: "boolean", alias: "i", description: "Interactive mode" },
        renderer: {
          type: "string",
          enum: ["opentui", "ink"],
          description: "Renderer",
        },
      });

      expect(global).toContain("Global Options");
      expect(global).toContain("--log-level");
      expect(global).toContain("--interactive");
      expect(global).toContain("--interactive, --no-interactive");
      expect(global).toContain("-i");
      expect(global).toContain("--renderer");
      expect(global).toContain("opentui");
      expect(global).toContain("ink");
    });

    test("generateCommandHelp includes global options when provided", () => {
      const cmd = new SimpleCommand({ name: "test", description: "Test" });
      const help = generateCommandHelp(cmd, {
        appName: "myapp",
        globalOptionsSchema: {
          interactive: { type: "boolean", alias: "i", description: "Interactive mode" },
        },
      });

      expect(help).toContain("Global Options");
      expect(help).toContain("--interactive");
      expect(help).toContain("--interactive, --no-interactive");
    });

    test("generateAppHelp includes global options when provided", () => {
      const commands = [new SimpleCommand({ name: "run", description: "Run something" })];
      const help = generateAppHelp(commands, {
        appName: "myapp",
        globalOptionsSchema: {
          renderer: { type: "string", enum: ["opentui", "ink"], description: "Renderer" },
        },
      });

      expect(help).toContain("Global Options");
      expect(help).toContain("--renderer");
    });
  });
});
