import { Text } from "ink";
import type { MenuItemProps } from "../../../semantic/types.ts";

export function MenuItem({ label, description, suffix, selected }: MenuItemProps) {
    const prefix = selected ? "> " : "  ";
    const desc = description ? ` — ${description}` : "";
    const suffixText = suffix ? ` ${suffix}` : "";

    return (
        <Text>
            {prefix}
            {label}
            {desc}
            {suffixText}
        </Text>
    );
}
