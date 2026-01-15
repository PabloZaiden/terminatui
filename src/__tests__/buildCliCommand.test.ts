import { describe, expect, test } from "bun:test";
import { buildCliCommand } from "../tui/utils/buildCliCommand.ts";
import type { OptionSchema } from "../types/command.ts";

describe("buildCliCommand", () => {
  test("builds CLI commands from schema + values", () => {
    const cases: Array<{
      name: string;
      commandPath: string[];
      schema: OptionSchema;
      values: Record<string, unknown>;
      expected: string;
    }> = [
      {
        name: "no options",
        commandPath: ["run"],
        schema: {},
        values: {},
        expected: "myapp run --mode cli",
      },
      {
        name: "string option",
        commandPath: ["greet"],
        schema: { name: { type: "string", description: "Name" } },
        values: { name: "John" },
        expected: "myapp greet --name John --mode cli",
      },
      {
        name: "quotes strings with spaces",
        commandPath: ["greet"],
        schema: { name: { type: "string", description: "Name" } },
        values: { name: "John Doe" },
        expected: "myapp greet --name \"John Doe\" --mode cli",
      },
      {
        name: "skips empty/undefined/null",
        commandPath: ["run"],
        schema: {
          name: { type: "string", description: "Name" },
          count: { type: "number", description: "Count" },
        },
        values: { name: "", count: null },
        expected: "myapp run --mode cli",
      },
      {
        name: "boolean flags only when needed",
        commandPath: ["run"],
        schema: {
          verbose: { type: "boolean", description: "Verbose" },
          quiet: { type: "boolean", description: "Quiet" },
        },
        values: { verbose: true, quiet: false },
        expected: "myapp run --verbose --mode cli",
      },
      {
        name: "number values",
        commandPath: ["process"],
        schema: { count: { type: "number", description: "Count" } },
        values: { count: 42 },
        expected: "myapp process --count 42 --mode cli",
      },
      {
        name: "array values",
        commandPath: ["process"],
        schema: { files: { type: "array", description: "Files" } },
        values: { files: ["a.txt", "b.txt"] },
        expected: "myapp process --files a.txt --files b.txt --mode cli",
      },
      {
        name: "nested command path",
        commandPath: ["db", "migrate"],
        schema: { force: { type: "boolean", description: "Force" } },
        values: { force: true },
        expected: "myapp db migrate --force --mode cli",
      },
      {
        name: "camelCase to kebab-case",
        commandPath: ["build"],
        schema: {
          outputDir: { type: "string", description: "Output directory" },
          maxRetries: { type: "number", description: "Max retries" },
        },
        values: { outputDir: "/tmp", maxRetries: 3 },
        expected: "myapp build --output-dir /tmp --max-retries 3 --mode cli",
      },
      {
        name: "skips defaults and uses --no- for booleans",
        commandPath: ["run"],
        schema: {
          verbose: { type: "boolean", description: "Verbose", default: false },
          count: { type: "number", description: "Count", default: 10 },
          color: { type: "boolean", description: "Color output", default: true },
        },
        values: { verbose: false, count: 10, color: false },
        expected: "myapp run --no-color --mode cli",
      },
    ];

    for (const c of cases) {
      expect(buildCliCommand("myapp", c.commandPath, c.schema, c.values), c.name).toBe(
        c.expected
      );
    }
  });
});
