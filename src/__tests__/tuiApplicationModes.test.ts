import { describe, test, expect } from "bun:test";
import { TuiApplication } from "../tui/TuiApplication.tsx";
import { Command, type CommandResult } from "../core/command.ts";
import type { OptionSchema, OptionValues, OptionDef } from "../types/command.ts";
import type { SupportedMode } from "../core/application.ts";

// Define a proper option schema
const testOptions = {
  value: { 
    type: "string" as const, 
    description: "Test value" 
  } satisfies OptionDef
} as const satisfies OptionSchema;

// Test command implementation
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

describe("TuiApplication mode support", () => {
  test("supports cli, opentui, and ink modes by default", () => {
    const app = new TuiApplication({
      name: "test-app",
      version: "1.0.0",
      commands: [],
    });
    
    // TuiApplication EXPANDS Application's modes
    expect((app as any).supportedModes).toEqual(["cli", "opentui", "ink"]);
  });

  test("runs successfully with cli mode", async () => {
    const cmd = new TestCommand();
    const app = new TuiApplication({
      name: "test-app",
      version: "1.0.0",
      commands: [cmd],
    });
    
    await app.runFromArgs(["--mode", "cli", "test", "--value", "hello"]);
    expect(cmd.executedWith?.["value"]).toBe("hello");
  });

  test("subclass can restrict to subset of modes", async () => {
    class OpenTuiOnlyApp extends TuiApplication {
      protected override get supportedModes(): readonly SupportedMode[] {
        return ["cli", "opentui"] as const;  // Restricts: removes "ink"
      }
    }
    
    const app = new OpenTuiOnlyApp({
      name: "test-app",
      version: "1.0.0",
      commands: [new TestCommand()],
    });
    
    expect((app as any).supportedModes).toEqual(["cli", "opentui"]);
    
    // ink mode should be rejected
    await expect(app.runFromArgs(["--mode", "ink", "test"]))
      .rejects.toThrow(/not supported.*Supported modes: cli, opentui/);
  });

  test("subclass can restrict to single TUI mode only", async () => {
    class InkOnlyApp extends TuiApplication {
      protected override get supportedModes(): readonly SupportedMode[] {
        return ["ink"] as const;  // Only ink, no cli or opentui
      }
      protected override defaultMode = "ink" as const;
    }
    
    const app = new InkOnlyApp({
      name: "test-app",
      version: "1.0.0",
      commands: [new TestCommand()],
    });
    
    expect((app as any).supportedModes).toEqual(["ink"]);
    
    // cli mode should be rejected
    await expect(app.runFromArgs(["--mode", "cli", "test"]))
      .rejects.toThrow(/not supported.*Supported modes: ink/);
  });

  test("subclass can restrict to cli only (no TUI)", async () => {
    class CliOnlyApp extends TuiApplication {
      protected override get supportedModes(): readonly SupportedMode[] {
        return ["cli"] as const;
      }
    }
    
    const app = new CliOnlyApp({
      name: "test-app",
      version: "1.0.0",
      commands: [new TestCommand()],
    });
    
    expect((app as any).supportedModes).toEqual(["cli"]);
    
    // opentui mode should be rejected
    await expect(app.runFromArgs(["--mode", "opentui", "test"]))
      .rejects.toThrow(/not supported.*Supported modes: cli/);
  });

  test("validateMode returns the resolved mode for valid modes", () => {
    const app = new TuiApplication({
      name: "test-app",
      version: "1.0.0",
      commands: [],
    });
    
    // Access protected method via any cast for testing
    const validateMode = (app as any).validateMode.bind(app);
    
    expect(validateMode("cli")).toBe("cli");
    expect(validateMode("opentui")).toBe("opentui");
    expect(validateMode("ink")).toBe("ink");
    expect(validateMode("default")).toBe("cli"); // default resolves to defaultMode which is "cli"
  });
});
