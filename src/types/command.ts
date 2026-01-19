/**
 * Option definition for command-line arguments
 */
export interface OptionDef {
  type: "string" | "number" | "boolean" | "array";
  description: string;
  alias?: string;
  default?: unknown;
  required?: boolean;
  enum?: readonly string[];
  min?: number;
  max?: number;

  // TUI-specific properties
  /** Display label in TUI form (defaults to key name) */
  label?: string;
  /** Display order in TUI form (lower = first) */
  order?: number;
  /** Group name for organizing fields in TUI */
  group?: string;
  /** Placeholder text for input fields */
  placeholder?: string;
  /** Hide this field from TUI (still available in CLI) */
  tuiHidden?: boolean;
}

/**
 * Schema defining all options for a command
 */
export type OptionSchema = Record<string, OptionDef>;

/**
 * Inferred option values from a schema
 */
export type OptionValues<T extends OptionSchema> = {
  [K in keyof T]: T[K]["type"] extends "string" ? string
  : T[K]["type"] extends "number" ? number
  : T[K]["type"] extends "boolean" ? boolean
  : T[K]["type"] extends "array" ? string[]
  : unknown;
};

