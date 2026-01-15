import { Text } from "ink";
import type { ValueProps } from "../../../semantic/types.ts";

function toText(node: unknown): string {
    if (node === null || node === undefined || typeof node === "boolean") {
        return "";
    }
    if (typeof node === "string" || typeof node === "number") {
        return String(node);
    }
    if (Array.isArray(node)) {
        return node.map(toText).join("");
    }
    if (typeof node === "object" && node && "props" in node) {
        const anyNode = node as any;
        return toText(anyNode.props?.children);
    }
    return "";
}

export function Value({ children }: ValueProps) {
    return <Text color="magenta">{toText(children)}</Text>;
}
