import { Text } from "ink";
import type { LabelProps } from "../../../semantic/types.ts";

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

function toPlainText(node: unknown): string {
    if (node === null || node === undefined || typeof node === "boolean") {
        return "";
    }
    if (typeof node === "string" || typeof node === "number") {
        return String(node);
    }
    if (Array.isArray(node)) {
        return node.map(toPlainText).join("");
    }
    if (typeof node === "object" && node && "props" in node) {
        const anyNode = node as any;
        return toPlainText(anyNode.props?.children);
    }
    return "";
}

export function Label({ color, bold, italic, children }: LabelProps) {
    const text = toPlainText(children);
    const inkColor = color ? (COLOR_MAP[color] ?? color) : undefined;
    return (
        <Text color={inkColor} bold={bold} italic={italic}>
            {text}
        </Text>
    );
}
