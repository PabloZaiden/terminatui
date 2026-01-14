import { describe, expect, test } from "bun:test";
import { getFieldDisplayValue, schemaToFieldConfigs } from "../tui/utils/schemaToFields.ts";
import type { OptionSchema } from "../types/command.ts";

describe("schemaToFields", () => {
  describe("schemaToFieldConfigs", () => {
    test("maps option schema to field configs", () => {
      const schema: OptionSchema = {
        name: { type: "string", description: "User name" },
        color: {
          type: "string",
          description: "Color choice",
          enum: ["red", "green", "blue"],
        },
        verbose: { type: "boolean", description: "Verbose output" },
        count: { type: "number", description: "Count" },
        files: { type: "array", description: "Files to process" },
        repoPath: {
          type: "string",
          description: "Repository path",
          label: "Repository",
        },
        hidden: { type: "string", description: "Hidden", tuiHidden: true },
        path: { type: "string", description: "Path", placeholder: "Enter path here" },
        grouped: { type: "string", description: "Grouped", group: "Basic" },
      };

      const fields = schemaToFieldConfigs(schema);

      // Basic mappings
      const name = fields.find((f) => f.key === "name");
      expect(name).toMatchObject({ type: "text", label: "Name" });

      const color = fields.find((f) => f.key === "color");
      expect(color?.type).toBe("enum");
      expect(color?.options?.length).toBe(3);

      expect(fields.find((f) => f.key === "verbose")?.type).toBe("boolean");
      expect(fields.find((f) => f.key === "count")?.type).toBe("number");
      expect(fields.find((f) => f.key === "files")?.type).toBe("text");

      // Decorations
      expect(fields.find((f) => f.key === "repoPath")?.label).toBe("Repository");
      expect(fields.some((f) => f.key === "hidden")).toBe(false);
      expect(fields.find((f) => f.key === "path")?.placeholder).toBe("Enter path here");
      expect(fields.find((f) => f.key === "grouped")?.group).toBe("Basic");
    });

    test("sorts by order", () => {
      const schema: OptionSchema = {
        third: { type: "string", description: "Third", order: 3 },
        first: { type: "string", description: "First", order: 1 },
        second: { type: "string", description: "Second", order: 2 },
      };

      const fields = schemaToFieldConfigs(schema);
      expect(fields.map((f) => f.key)).toEqual(["first", "second", "third"]);
    });
  });

  describe("getFieldDisplayValue", () => {
    test("formats values for display", () => {
      expect(getFieldDisplayValue(true, { key: "enabled", label: "Enabled", type: "boolean" })).toBe(
        "True"
      );
      expect(getFieldDisplayValue(false, { key: "enabled", label: "Enabled", type: "boolean" })).toBe(
        "False"
      );

      const enumField = {
        key: "color",
        label: "Color",
        type: "enum" as const,
        options: [
          { name: "Red", value: "red" },
          { name: "Green", value: "green" },
        ],
      };
      expect(getFieldDisplayValue("red", enumField)).toBe("Red");

      const textField = { key: "name", label: "Name", type: "text" as const };
      expect(getFieldDisplayValue("", textField)).toBe("(empty)");
      expect(getFieldDisplayValue(null, textField)).toBe("(empty)");
      expect(getFieldDisplayValue(undefined, textField)).toBe("(empty)");
      expect(getFieldDisplayValue("hello", textField)).toBe("hello");

      const longValue = "a".repeat(100);
      const longResult = getFieldDisplayValue(longValue, { key: "desc", label: "Description", type: "text" });
      expect(longResult.length).toBe(60);
      expect(longResult.endsWith("...")).toBe(true);
    });
  });
});
