import type { OptionSchema } from "../../types/command.ts";
import type { ParseError } from "../../cli/parser.ts";

/**
 * Validate option values for TUI execution.
 * 
 * This differs from CLI validation in that:
 * - Empty strings are treated as missing for required string fields
 * - Empty arrays are treated as missing for required array fields
 * 
 * @param schema - The option schema to validate against
 * @param values - The current option values
 * @returns Array of validation errors (empty if valid)
 */
export function validateTuiOptions(
    schema: OptionSchema,
    values: Record<string, unknown>
): ParseError[] {
    const errors: ParseError[] = [];

    for (const [name, def] of Object.entries(schema)) {
        const value = values[name];

        // For required fields: check undefined AND empty values
        if (def.required) {
            const isMissing =
                value === undefined ||
                (def.type === "string" && value === "") ||
                (def.type === "array" && Array.isArray(value) && value.length === 0);

            if (isMissing) {
                errors.push({
                    type: "missing_required",
                    message: `Missing required option: ${name}`,
                    field: name,
                });
            }
        }

        // Number range validation
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
