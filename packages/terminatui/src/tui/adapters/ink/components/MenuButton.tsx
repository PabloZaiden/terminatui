import { Text } from "ink";
import type { MenuButtonProps } from "../../../semantic/types.ts";

export function MenuButton({ label, selected }: MenuButtonProps) {
    const prefix = selected ? "> " : "  ";
    return (
        <Text>
            {prefix}
            {label}
        </Text>
    );
}
