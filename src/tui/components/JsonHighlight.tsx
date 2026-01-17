import { tokenizeJsonValue, type JsonToken } from "../utils/jsonTokenizer.ts";
import { SemanticColors } from "../theme.ts";

/**
 * JSON syntax highlighting utility.
 *
 * This is intentionally kept under `src/tui/components/*` because it can be used
 * by external apps importing from this package.
 * 
 * Returns an ANSI-colored string suitable for terminal output.
 */
export interface JsonHighlightProps {
    value: unknown;
}

function getTokenColor(type: JsonToken["type"]): string {
    switch (type) {
        case "punctuation":
            return SemanticColors.mutedText;
        case "key":
            return SemanticColors.primary;
        case "string":
            return SemanticColors.success;
        case "number":
            return SemanticColors.warning;
        case "boolean":
            return SemanticColors.primary;
        case "null":
            return SemanticColors.mutedText;
    }
}

function toAnsiColor(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `\x1b[38;2;${r};${g};${b}m`;
}

const RESET = "\x1b[0m";

export function JsonHighlight({ value }: JsonHighlightProps): string {
    const lines = tokenizeJsonValue(value);
    
    return lines.map((tokens) => 
        tokens.map((token) => {
            const color = getTokenColor(token.type);
            return `${toAnsiColor(color)}${token.value}${RESET}`;
        }).join("")
    ).join("\n");
}
