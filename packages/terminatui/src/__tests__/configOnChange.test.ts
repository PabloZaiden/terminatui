import { test, expect } from "bun:test";
import { Command, type CommandResult } from "../core/command.ts";
import type { OptionSchema } from "../types/command.ts";

class TestCommand extends Command<typeof TestCommand.Options> {
  static readonly Options = {
    a: { type: "string" as const, description: "a" },
    b: { type: "string" as const, description: "b" },
  } as const satisfies OptionSchema;

  readonly name = "my";
  readonly description = "my";
  readonly options = TestCommand.Options;

  public readonly onChangeCalls: Array<[
    string,
    unknown,
    Record<string, unknown>
  ]> = [];

  override async execute(): Promise<CommandResult> {
    return { success: true };
  }

  override onConfigChange(
    key: string,
    value: unknown,
    allValues: Record<string, unknown>
  ) {
    this.onChangeCalls.push([key, value, allValues]);
    if (key === "a") {
      return { b: "derived" };
    }
    return undefined;
  }

  applyTuiConfigChange(
    key: string,
    value: unknown,
    values: Record<string, unknown>
  ): Record<string, unknown> {
    let nextValues: Record<string, unknown> = { ...values, [key]: value };

    const updates = this.onConfigChange?.(key, value, nextValues);
    if (updates && typeof updates === "object") {
      nextValues = { ...nextValues, ...updates };
    }

    return nextValues;
  }
}

test("onConfigChange merges returned updates", () => {
  const command = new TestCommand();

  const next = command.applyTuiConfigChange("a", "new", {
    a: "old",
    b: "oldb",
  });

  expect(command.onChangeCalls.length).toBe(1);
  expect(command.onChangeCalls[0]?.[0]).toBe("a");
  expect(command.onChangeCalls[0]?.[1]).toBe("new");
  expect(next).toEqual({ a: "new", b: "derived" });
});

test("onConfigChange returns undefined when no updates needed", () => {
  const command = new TestCommand();

  // Changing field "b" returns undefined from onConfigChange
  const next = command.applyTuiConfigChange("b", "newB", {
    a: "old",
    b: "oldb",
  });

  expect(command.onChangeCalls.length).toBe(1);
  expect(command.onChangeCalls[0]?.[0]).toBe("b");
  expect(command.onChangeCalls[0]?.[1]).toBe("newB");
  // Value should still be updated even though onConfigChange returned undefined
  expect(next).toEqual({ a: "old", b: "newB" });
});

// Test command without onConfigChange to verify backward compatibility
class CommandWithoutOnConfigChange extends Command<typeof CommandWithoutOnConfigChange.Options> {
  static readonly Options = {
    x: { type: "string" as const, description: "x" },
    y: { type: "string" as const, description: "y" },
  } as const satisfies OptionSchema;

  readonly name = "noChange";
  readonly description = "Command without onConfigChange";
  readonly options = CommandWithoutOnConfigChange.Options;

  override async execute(): Promise<CommandResult> {
    return { success: true };
  }

  // This simulates what ConfigController does - works with or without onConfigChange
  applyTuiConfigChange(
    key: string,
    value: unknown,
    values: Record<string, unknown>
  ): Record<string, unknown> {
    let nextValues: Record<string, unknown> = { ...values, [key]: value };

    const updates = this.onConfigChange?.(key, value, nextValues);
    if (updates && typeof updates === "object") {
      nextValues = { ...nextValues, ...updates };
    }

    return nextValues;
  }
}

test("commands without onConfigChange work correctly (backward compatibility)", () => {
  const command = new CommandWithoutOnConfigChange();

  const next = command.applyTuiConfigChange("x", "newX", {
    x: "old",
    y: "oldy",
  });

  // Value should be updated normally
  expect(next).toEqual({ x: "newX", y: "oldy" });
});
