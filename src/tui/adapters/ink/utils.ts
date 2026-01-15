export function toPlainText(node: unknown): string {
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
