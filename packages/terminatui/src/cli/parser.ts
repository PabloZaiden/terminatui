import type { OptionSchema, OptionValues } from "../types/command.ts";
import { type ParseArgsConfig } from "util";

export interface ParseError {
  type: "unknown_command" | "invalid_option" | "missing_required" | "validation";
  message: string;
  field?: string;
}

/**
 * Extract command chain from args (commands before flags)
 */
export function extractCommandChain(args: string[]): {
  commands: string[];
  remaining: string[];
} {
  const commands: string[] = [];
  const remaining: string[] = [];

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (!arg) {
      continue;
    }

    if (arg.startsWith("-")) {
      remaining.push(arg);

      const next = args[i + 1];
      if (next && !next.startsWith("-")) {
        remaining.push(next);
        i += 1;
      }

      continue;
    }

    if (remaining.length > 0) {
      remaining.push(arg);
      continue;
    }

    commands.push(arg);
  }

  return {
    commands,
    remaining,
  };
}

/**
 * Convert option schema to parseArgs config
 */
export function schemaToParseArgsOptions(schema: OptionSchema): {
  options: ParseArgsConfig["options"];
} {
  const options: NonNullable<ParseArgsConfig["options"]> = {};

  for (const [name, def] of Object.entries(schema)) {
    const parseArgsType = def.type === "boolean" ? "boolean" : "string";
    
    const opt: NonNullable<ParseArgsConfig["options"]>[string] = {
      type: parseArgsType,
      multiple: def.type === "array",
    };
    
    // Only include short if alias is defined (parseArgs doesn't like undefined)
    if (def.alias) {
      opt.short = def.alias;
    }
    
    // Only include default if defined
    // For non-boolean types, parseArgs expects string defaults
    if (def.default !== undefined) {
      if (parseArgsType === "string" && typeof def.default !== "string") {
        opt.default = String(def.default);
      } else {
        opt.default = def.default as string | boolean | string[] | boolean[];
      }
    }
    
    options[name] = opt;
  }

  return { options };
}

/**
 * Parse and coerce option values
 */
export function parseOptionValues<T extends OptionSchema>(
  schema: T,
  values: Record<string, unknown>
): OptionValues<T> {
  const result: Record<string, unknown> = {};

  for (const [name, def] of Object.entries(schema)) {
    let value = values[name];

    // Apply default
    if (value === undefined && def.default !== undefined) {
      value = def.default;
    }

    // Coerce type
    if (value !== undefined) {
      if (def.type === "number" && typeof value === "string") {
        value = Number(value);
      } else if (def.type === "boolean" && typeof value === "string") {
        value = value === "true" || value === "1";
      }

      // Validate enum
      if (def.enum && !def.enum.includes(String(value))) {
        throw new Error(`Invalid value "${value}" for option "${name}". Must be one of: ${def.enum.join(", ")}`);
      }
    }

    result[name] = value;
  }

  return result as OptionValues<T>;
}

/**
 * Validate option values
 */
export function validateOptions<T extends OptionSchema>(
  schema: T,
  values: OptionValues<T>
): ParseError[] {
  const errors: ParseError[] = [];

  for (const [name, def] of Object.entries(schema)) {
    const value = values[name as keyof typeof values];

    if (def.required && value === undefined) {
      errors.push({
        type: "missing_required",
        message: `Missing required option: ${name}`,
        field: name,
      });
    }

    if (def.type === "number" && typeof value === "number") {
      if (def.min !== undefined && value < def.min) {
        errors.push({
          type: "validation",
          message: `Option "${name}" must be at least ${def.min}`,
          field: name,
        });
      }
      if (def.max !== undefined && value > def.max) {
        errors.push({
          type: "validation",
          message: `Option "${name}" must be at most ${def.max}`,
          field: name,
        });
      }
    }
  }

  return errors;
}

