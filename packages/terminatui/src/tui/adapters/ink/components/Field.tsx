import { Text } from "ink";
import type { FieldProps } from "../../../semantic/types.ts";

export function Field({ label, value, selected }: FieldProps) {
    const prefix = selected ? "> " : "  ";
    return (
        <Text>
            {prefix}
            {label}: {value as any}
        </Text>
    );
}
