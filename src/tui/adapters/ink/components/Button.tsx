import { Text } from "ink";
import type { ButtonProps } from "../../../semantic/types.ts";

export function Button({ label, selected }: ButtonProps) {
    const prefix = selected ? "> " : "  ";
    return (
        <Text>
            {prefix}
            {label}
        </Text>
    );
}
