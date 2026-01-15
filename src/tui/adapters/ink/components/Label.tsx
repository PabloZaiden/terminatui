import { Text } from "ink";
import type { LabelProps } from "../../../semantic/types.ts";
import { toPlainText } from "../utils.ts";

const COLOR_MAP: Record<string, string> = {
    text: "white",
    mutedText: "gray",
    primary: "cyan",
    success: "green",
    warning: "yellow",
    error: "red",
    value: "magenta",
    code: "gray",
};

export function Label({ color, bold, italic, children }: LabelProps) {
    const text = toPlainText(children);
    const inkColor = color ? (COLOR_MAP[color] ?? color) : undefined;
    return (
        <Text color={inkColor} bold={bold} italic={italic}>
            {text}
        </Text>
    );
}
