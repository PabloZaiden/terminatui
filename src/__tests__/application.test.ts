import { describe, test, expect } from "bun:test";
import { Application } from "../core/application.ts";
import { Command, type CommandResult } from "../core/command.ts";
import type { OptionSchema, OptionValues, OptionDef } from "../types/command.ts";
import { AppContext } from "../core/context.ts";
import { LogLevel } from "../core/logger.ts";
import { KNOWN_COMMANDS } from "../core/knownCommands.ts";

// Define a proper option schema
const testOptions = {
  value: { 
    type: "string" as const, 
    description: "Test value" 
  } satisfies OptionDef
} as const satisfies OptionSchema;

// Test command implementations
class TestCommand extends Command<typeof testOptions> {
  readonly name = "test";
  readonly description = "A test command";
  readonly options = testOptions;

  executedWith: Record<string, unknown> | null = null;

  override async execute(
    opts: OptionValues<typeof testOptions>
  ): Promise<CommandResult> {
    this.executedWith = opts as Record<string, unknown>;
    return { success: true };
  }
}

class TuiCommand extends Command<OptionSchema> {
  readonly name = "tui-cmd";
  readonly description = "A TUI command";
  readonly options = {};

  executed = false;

  override async execute(): Promise<CommandResult> {
    this.executed = true;
    return { success: true };
  }
}

describe("Application", () => {
  describe("constructor", () => {
    test("rejects reserved help command definitions", () => {
      class ReservedCommand extends Command<OptionSchema> {
        readonly name = KNOWN_COMMANDS.help;
        readonly description = "tries to override built-in";
        readonly options = {};

        override async execute(): Promise<CommandResult> {
          return { success: true };
        }
      }

      expect(() => {
        new Application({
          name: "test-app",
          version: "1.0.0",
          commands: [new ReservedCommand()],
        });
      }).toThrow(/reserved/i);

      class SubCommand extends Command<OptionSchema> {
        readonly name = KNOWN_COMMANDS.help;
        readonly description = "user help";
        readonly options = {};

        override async execute(): Promise<CommandResult> {
          return { success: true };
        }
      }

      class ParentCommand extends Command<OptionSchema> {
        readonly name = "parent";
        readonly description = "parent";
        readonly options = {};

        override subCommands = [new SubCommand()];

        override async execute(): Promise<CommandResult> {
          return { success: true };
        }
      }

      expect(() => {
        new Application({
          name: "test-app",
          version: "1.0.0",
          commands: [new ParentCommand()],
        });
      }).toThrow(/automatically injected/i);
    });

    test("creates application with name and version", () => {
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [],
      });
      expect(app.name).toBe("test-app");
      expect(app.version).toBe("1.0.0");
    });

    test("creates context as side effect of creating application", () => {
      // side effect of creating an application is setting the current context
      new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [],
      });
      
      expect(AppContext.current.config.name).toBe("test-app");
      expect(AppContext.current.config.version).toBe("1.0.0");
    });

    test("registers provided commands", () => {
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      expect(app.registry.has("test")).toBe(true);
    });

    test("auto-registers version command", () => {
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [],
      });
      expect(app.registry.has("version")).toBe(true);
    });

    test("auto-registers help command", () => {
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [],
      });
      expect(app.registry.has(KNOWN_COMMANDS.help)).toBe(true);
    });

    test("injects help subcommand into commands", () => {
      const cmd = new TestCommand();
      // Creating the Application injects help into commands
      new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      expect(cmd.subCommands).toBeDefined();
      expect(cmd.subCommands?.some((c) => c.name === KNOWN_COMMANDS.help)).toBe(true);
    });
  });

  describe("run", () => {
    test("runs default command when no args", async () => {
      const cmd = new TuiCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
        defaultCommand: "tui-cmd",
      });
      await app.runFromArgs([]);
      expect(cmd.executed).toBe(true);
    });

    test("runs specified command and passes options", async () => {
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });

      await app.runFromArgs(["test", "--value", "hello"]);
      expect(cmd.executedWith?.["value"]).toBe("hello");
    });

    test("with no args and no default, prints help (no throw)", async () => {
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [new TestCommand()],
      });

      await app.runFromArgs([]);
    });
  });

  describe("lifecycle hooks", () => {
    test("calls onBeforeRun", async () => {
      let called = false;
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      app.setHooks({
        onBeforeRun: async () => {
          called = true;
        },
      });
      await app.runFromArgs(["test"]);
      expect(called).toBe(true);
    });

    test("calls onAfterRun", async () => {
      let called = false;
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      app.setHooks({
        onAfterRun: async () => {
          called = true;
        },
      });
      await app.runFromArgs(["test"]);
      expect(called).toBe(true);
    });

    test("calls onError on exception", async () => {
      let errorCaught: Error | undefined;

      class ErrorCommand extends Command<OptionSchema> {
        readonly name = "error-cmd";
        readonly description = "A command that throws";
        readonly options = {};

        override async execute(): Promise<CommandResult> {
          throw new Error("Test error");
        }
      }

      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [new ErrorCommand()],
      });
      app.setHooks({
        onError: async (error) => {
          errorCaught = error;
        },
      });
      await app.runFromArgs(["error-cmd"]);
      expect(errorCaught?.message).toBe("Test error");
    });
  });

  describe("buildConfig", () => {
    // Config type for testing
    interface ParsedConfig {
      value: string;
      count: number;
    }

    const configOptions = {
      value: { type: "string" as const, description: "A value" },
      count: { type: "string" as const, description: "A count" },
    } as const satisfies OptionSchema;

    test("calls buildConfig before execute", async () => {
      let buildConfigCalled = false;
      let receivedConfig: ParsedConfig | null = null as ParsedConfig | null;

      class ConfigCommand extends Command<typeof configOptions, ParsedConfig> {
        readonly name = "config-cmd";
        readonly description = "A command with buildConfig";
        readonly options = configOptions;

        override buildConfig(
          opts: OptionValues<typeof configOptions>
        ): ParsedConfig {
          buildConfigCalled = true;
          return {
            value: opts.value as string,
            count: parseInt(opts.count as string, 10),
          };
        }

        override async execute(config: ParsedConfig): Promise<CommandResult> {
          receivedConfig = config;
          return { success: true };
        }
      }

      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [new ConfigCommand()],
      });

      await app.runFromArgs(["config-cmd", "--value", "test", "--count", "42"]);
      
      expect(buildConfigCalled).toBe(true);
      expect(receivedConfig).toEqual({ value: "test", count: 42 });
    });

    test("passes raw options when buildConfig is not defined", async () => {
      let receivedOpts: Record<string, unknown> | null = null as Record<string, unknown> | null;

      class NoConfigCommand extends Command<typeof testOptions> {
        readonly name = "no-config-cmd";
        readonly description = "A command without buildConfig";
        readonly options = testOptions;

        override async execute(
          opts: OptionValues<typeof testOptions>
        ): Promise<CommandResult> {
          receivedOpts = opts as Record<string, unknown>;
          return { success: true };
        }
      }

      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [new NoConfigCommand()],
      });

      await app.runFromArgs(["no-config-cmd", "--value", "hello"]);
      
      expect(receivedOpts).toEqual({ value: "hello" });
    });

    test("buildConfig errors are caught and handled", async () => {
      let errorCaught: Error | undefined;

      class FailConfigCommand extends Command<typeof testOptions, never> {
        readonly name = "fail-config";
        readonly description = "A command that fails buildConfig";
        readonly options = testOptions;

        override buildConfig(): never {
          throw new Error("Config validation failed");
        }

        override async execute(): Promise<CommandResult> {
          // Should never be called
          return { success: true };
        }
      }

      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [new FailConfigCommand()],
      });
      
      app.setHooks({
        onError: async (error) => {
          errorCaught = error;
        },
      });

      await app.runFromArgs(["fail-config", "--value", "test"]);
      
      expect(errorCaught?.message).toBe("Config validation failed");
    });
  });

  describe("global options", () => {
    test("parses --log-level before command", async () => {
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      
      // Should not throw - global option should be parsed and removed
      await app.runFromArgs(["--log-level", "debug", "test", "--value", "hello"]);
      expect(cmd.executedWith?.["value"]).toBe("hello");
    });

    test("parses --log-level after command", async () => {
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      
      await app.runFromArgs(["test", "--log-level", "debug", "--value", "hello"]);
      expect(cmd.executedWith?.["value"]).toBe("hello");
    });

    test("applies log-level case-insensitively", async () => {
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      
      // All of these should work (case-insensitive)
      await app.runFromArgs(["--log-level", "debug", "test"]);
      expect(AppContext.current.logger.getMinLevel()).toBe(LogLevel.debug);
      
      await app.runFromArgs(["--log-level", "Debug", "test"]);
      expect(AppContext.current.logger.getMinLevel()).toBe(LogLevel.debug);
      
      await app.runFromArgs(["--log-level", "DEBUG", "test"]);
      expect(AppContext.current.logger.getMinLevel()).toBe(LogLevel.debug);
    });

    test("parses --detailed-logs flag", async () => {
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      
      await app.runFromArgs(["--detailed-logs", "test"]);
      // Should not throw - flag is recognized
      expect(cmd.executedWith).not.toBeNull();
    });

    test("parses --no-detailed-logs flag", async () => {
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      
      await app.runFromArgs(["--no-detailed-logs", "test"]);
      // Should not throw - flag is recognized
      expect(cmd.executedWith).not.toBeNull();
    });

    test("parses --log-level=value format", async () => {
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      
      await app.runFromArgs(["--log-level=warn", "test"]);
      expect(AppContext.current.logger.getMinLevel()).toBe(LogLevel.warn);
    });
  });

  describe("non-leaf commands", () => {
    test("non-leaf command without execute shows help", async () => {
      // Create a container command (has subcommands but no execute)
      class SubCommand extends Command<OptionSchema> {
        readonly name = "sub";
        readonly description = "A sub command";
        readonly options = {};

        override async execute(): Promise<CommandResult> {
          return { success: true, data: "sub executed" };
        }
      }

      class ContainerCommand extends Command<OptionSchema> {
        readonly name = "container";
        readonly description = "A container command";
        readonly options = {};
        override readonly subCommands = [new SubCommand()];
        // Note: No execute() override - uses base class which throws
      }

      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [new ContainerCommand()],
      });

      // Running the container command should not throw - it should show help
      await app.runFromArgs(["container"]);
      // If we get here without throwing, the test passes
    });

    test("non-leaf command with custom execute runs execute", async () => {
      let containerExecuted = false;

      class SubCommand extends Command<OptionSchema> {
        readonly name = "sub";
        readonly description = "A sub command";
        readonly options = {};

        override async execute(): Promise<CommandResult> {
          return { success: true };
        }
      }

      class ContainerWithExecute extends Command<OptionSchema> {
        readonly name = "container";
        readonly description = "A container with execute";
        readonly options = {};
        override readonly subCommands = [new SubCommand()];

        override async execute(): Promise<CommandResult> {
          containerExecuted = true;
          return { success: true };
        }
      }

      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [new ContainerWithExecute()],
      });

      await app.runFromArgs(["container"]);
      expect(containerExecuted).toBe(true);
    });

    test("subcommand of non-leaf command still executes", async () => {
      let subExecuted = false;

      class SubCommand extends Command<OptionSchema> {
        readonly name = "sub";
        readonly description = "A sub command";
        readonly options = {};

        override async execute(): Promise<CommandResult> {
          subExecuted = true;
          return { success: true };
        }
      }

      class ContainerCommand extends Command<OptionSchema> {
        readonly name = "container";
        readonly description = "A container command";
        readonly options = {};
        override readonly subCommands = [new SubCommand()];
        // No execute() override
      }

      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [new ContainerCommand()],
      });

      await app.runFromArgs(["container", "sub"]);
      expect(subExecuted).toBe(true);
    });
  });

  describe("mode support", () => {
    test("only supports cli mode by default", () => {
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [],
      });
      // Access protected property via any cast for testing
      expect((app as any).supportedModes).toEqual(["cli"]);
    });

    test("throws error for opentui mode", async () => {
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      
      let errorThrown: Error | undefined;
      app.setHooks({
        onError: async (error) => {
          errorThrown = error;
        },
      });
      
      await app.runFromArgs(["--mode", "opentui", "test"]);
      expect(errorThrown?.message).toMatch(/not supported.*Supported modes: cli/);
    });

    test("throws error for ink mode", async () => {
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      
      let errorThrown: Error | undefined;
      app.setHooks({
        onError: async (error) => {
          errorThrown = error;
        },
      });
      
      await app.runFromArgs(["--mode", "ink", "test"]);
      expect(errorThrown?.message).toMatch(/not supported.*Supported modes: cli/);
    });

    test("runs successfully with cli mode", async () => {
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      
      await app.runFromArgs(["--mode", "cli", "test", "--value", "hello"]);
      expect(cmd.executedWith?.["value"]).toBe("hello");
    });

    test("runs successfully with default mode (resolves to cli)", async () => {
      const cmd = new TestCommand();
      const app = new Application({
        name: "test-app",
        version: "1.0.0",
        commands: [cmd],
      });
      
      await app.runFromArgs(["--mode", "default", "test", "--value", "world"]);
      expect(cmd.executedWith?.["value"]).toBe("world");
    });

    test("subclass can override supportedModes", () => {
      class CustomApp extends Application {
        protected override get supportedModes() {
          return ["cli"] as const;
        }
      }
      
      const app = new CustomApp({
        name: "test-app",
        version: "1.0.0",
        commands: [],
      });
      
      expect((app as any).supportedModes).toEqual(["cli"]);
    });
  });
});
