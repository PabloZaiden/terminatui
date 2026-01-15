import { test, expect, describe, beforeEach, afterEach } from "bun:test";
import { createVersionCommand } from "../builtins/version.ts";
import { createHelpCommandForParent, createRootHelpCommand } from "../builtins/help.ts";
import { Command } from "../core/command.ts";
import { KNOWN_COMMANDS } from "../core/knownCommands.ts";

describe("Built-in Commands", () => {
  let originalLog: typeof console.log;
  let logOutput: string[];

  beforeEach(() => {
    originalLog = console.log;
    logOutput = [];
    console.log = (...args: unknown[]) => {
      logOutput.push(args.map(String).join(" "));
    };
  });

  afterEach(() => {
    console.log = originalLog;
  });


  describe("VersionCommand", () => {
    test("creates command with name 'version'", () => {
      const cmd = createVersionCommand("myapp", "1.0.0");
      expect(cmd.name).toBe("version");
    });

    test("has description", () => {
      const cmd = createVersionCommand("myapp", "1.0.0");
      expect(cmd.description).toBeDefined();
      expect(cmd.description.length).toBeGreaterThan(0);
    });

    test("has aliases including --version", () => {
      const cmd = createVersionCommand("myapp", "1.0.0");
      expect(cmd.aliases).toContain("--version");
      expect(cmd.aliases).toContain("-v");
    });

    test("getFormattedVersion returns version with dev", () => {
      const cmd = createVersionCommand("myapp", "1.2.3");
      expect(cmd.getFormattedVersion()).toBe("1.2.3 - (dev)");
    });

    test("getFormattedVersion returns version with commit hash", () => {
      const cmd = createVersionCommand("myapp", "1.2.3", "abc1234567890");
      expect(cmd.getFormattedVersion()).toBe("1.2.3 - abc1234");
    });
  });

  describe("HelpCommand", () => {
    test("createRootHelpCommand creates command with name 'help'", () => {
      const cmd = createRootHelpCommand([], "myapp", "1.0.0");
      expect(cmd.name).toBe(KNOWN_COMMANDS.help);
    });

    test("is hidden in TUI", () => {
      const cmd = createRootHelpCommand([], "myapp", "1.0.0");
      expect(cmd.tuiHidden).toBe(true);
      expect(cmd.supportsTui()).toBe(false);
    });

    test("execute prints app help", async () => {
      const cmd = createRootHelpCommand([], "myapp", "1.0.0");
      await cmd.execute();
      expect(logOutput.join("\n")).toContain("myapp");
    });

    test("createHelpCommandForParent prints parent help", async () => {
      class ParentCommand extends Command {
        readonly name = "run";
        readonly description = "Run something";
        readonly options = {} as const;

        override async execute(): Promise<void> {}
      }

      const cmd = createHelpCommandForParent(new ParentCommand(), "myapp", "1.0.0");
      await cmd.execute();
      expect(logOutput.join("\n")).toContain("run");
    });
  });
});
