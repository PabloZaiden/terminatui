import { SemanticColors } from "../theme.ts";

/**
 * JSON syntax highlighting component.
 *
 * This is intentionally kept under `src/tui/components/*` because it can be used
 * by external apps importing from this package.
 */
export interface JsonHighlightProps {
    value: unknown;
}

type TokenType = "punctuation" | "key" | "string" | "number" | "boolean" | "null" | "text";

type Token = {
    type: TokenType;
    text: string;
};

function getTokenColor(type: TokenType): string {
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
        case "text":
            return SemanticColors.text;
    }
}

function tokenizeJson(json: string): Token[] {
    const tokens: Token[] = [];

    // Very small JSON tokenizer optimized for pretty-printed output.
    // Matches strings (including escaped), numbers, booleans, null, and punctuation.
    const regex =
        /("(?:\\.|[^"\\])*"\s*:)|("(?:\\.|[^"\\])*")|\b(true|false|null)\b|(-?\d+(?:\.\d+)?(?:[eE][+-]?\d+)?)|([{}\[\],:])/g;

    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = regex.exec(json)) !== null) {
        if (match.index > lastIndex) {
            tokens.push({ type: "punctuation", text: json.slice(lastIndex, match.index) });
        }

        if (match[1]) {
            const keyPart = match[1].slice(0, match[1].lastIndexOf(":"));
            tokens.push({ type: "key", text: keyPart });
            tokens.push({ type: "punctuation", text: ":" });
        } else if (match[2]) {
            tokens.push({ type: "string", text: match[2] });
        } else if (match[3]) {
            const literal = match[3];
            tokens.push({ type: literal === "null" ? "null" : "boolean", text: literal });
        } else if (match[4]) {
            tokens.push({ type: "number", text: match[4] });
        } else if (match[5]) {
            tokens.push({ type: "punctuation", text: match[5] });
        }

        lastIndex = regex.lastIndex;
    }

    if (lastIndex < json.length) {
        tokens.push({ type: "punctuation", text: json.slice(lastIndex) });
    }

    return tokens;
}

export function JsonHighlight({ value }: JsonHighlightProps) {
    const json = JSON.stringify(value, null, 2);
    const tokens = tokenizeJson(json);

    // This component is used across renderers. We keep it renderer-agnostic by
    // emitting plain text with ANSI escape sequences for coloring.
    return tokens.map((token) => {
        const color = getTokenColor(token.type);
        return `\x1b[38;2;${parseInt(color.slice(1, 3), 16)};${parseInt(color.slice(3, 5), 16)};${parseInt(color.slice(5, 7), 16)}m${token.text}\x1b[0m`;
    });
}
