import { describe, expect, test } from "bun:test";
import {
  extractCommandChain,
  parseOptionValues,
  schemaToParseArgsOptions,
  validateOptions,
} from "../cli/parser.ts";
import type { OptionSchema } from "../types/command.ts";

describe("cli/parser helpers", () => {
  describe("extractCommandChain", () => {
    test("splits commands from flags", () => {
      const cases: Array<{
        args: string[];
        expected: { commands: string[]; remaining: string[] };
      }> = [
        { args: ["run", "test"], expected: { commands: ["run", "test"], remaining: [] } },
        {
          args: ["run", "--verbose", "file.ts"],
          expected: { commands: ["run"], remaining: ["--verbose", "file.ts"] },
        },
        { args: ["--help"], expected: { commands: [], remaining: ["--help"] } },
        { args: ["run", "-v"], expected: { commands: ["run"], remaining: ["-v"] } },
        { args: [], expected: { commands: [], remaining: [] } },
        {
          args: ["config", "set", "--key", "value"],
          expected: { commands: ["config", "set"], remaining: ["--key", "value"] },
        },
      ];

      for (const c of cases) {
        expect(extractCommandChain(c.args)).toEqual(c.expected);
      }
    });
  });

  describe("schemaToParseArgsOptions", () => {
    test("converts OptionSchema to parseArgs config", () => {
      const schema: OptionSchema = {
        name: { type: "string", description: "Name" },
        verbose: { type: "boolean", alias: "v", default: false, description: "Verbose" },
        files: { type: "array", description: "Files" },
        count: { type: "number", default: 10, description: "Count" },
      };

      const result = schemaToParseArgsOptions(schema);

      expect(result.options?.["name"]).toMatchObject({ type: "string" });
      expect(result.options?.["verbose"]).toMatchObject({
        type: "boolean",
        short: "v",
        default: false,
      });
      expect(result.options?.["files"]).toMatchObject({ multiple: true });
      // parseArgs expects string defaults for non-boolean types
      expect(result.options?.["count"]).toMatchObject({ type: "string", default: "10" });
    });
  });

  describe("parseOptionValues", () => {
    test("coerces values, applies defaults, and reads env", () => {
      process.env["TEST_VALUE"] = "env-value";

      const schema: OptionSchema = {
        name: { type: "string", description: "Name" },
        count: { type: "number", default: 5, description: "Count" },
        verbose: { type: "boolean", description: "Verbose" },
        value: { type: "string", env: "TEST_VALUE", description: "Value" },
        level: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Level",
        },
      };

      const result = parseOptionValues(schema, {
        name: "test",
        count: "42",
        verbose: "true",
        level: "medium",
      });

      expect(result["name"]).toBe("test");
      expect(result["count"]).toBe(42);
      expect(result["verbose"]).toBe(true);
      expect(result["value"]).toBe("env-value");
      expect(result["level"]).toBe("medium");

      delete process.env["TEST_VALUE"];
    });

    test("throws on invalid enum", () => {
      const schema: OptionSchema = {
        level: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Level",
        },
      };

      expect(() => parseOptionValues(schema, { level: "invalid" })).toThrow();
    });
  });

  describe("validateOptions", () => {
    test("returns errors for missing required and invalid ranges", () => {
      const schema: OptionSchema = {
        name: { type: "string", required: true, description: "Name" },
        count: { type: "number", min: 1, max: 10, description: "Count" },
      };

      expect(validateOptions(schema, { name: "ok", count: 5 })).toEqual([]);

      const missing = validateOptions(schema, {} as Record<string, unknown>);
      expect(missing.some((e) => e.type === "missing_required" && e.field === "name")).toBe(true);

      const tooLow = validateOptions(schema, { name: "ok", count: 0 });
      expect(tooLow.some((e) => e.type === "validation" && e.field === "count")).toBe(true);
    });
  });
});

