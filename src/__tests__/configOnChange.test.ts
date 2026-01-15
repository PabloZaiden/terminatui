import { test, expect } from "bun:test";
import { Command } from "../core/command.ts";
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

  override execute(): void {}

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
