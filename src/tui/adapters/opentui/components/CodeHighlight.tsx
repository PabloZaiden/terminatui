import type { CodeHighlightProps, CodeTokenType } from "../../../semantic/types.ts";
import { Theme } from "../../../theme.ts";

const TOKEN_COLORS: Record<CodeTokenType, string> = {
    key: Theme.colors.primary,
    string: Theme.colors.success,
    number: "#d19a66",
    boolean: "#c678dd",
    null: "#c678dd",
    punctuation: Theme.colors.mutedText,
    unknown: Theme.colors.text,
};

export function CodeHighlight({ tokens }: CodeHighlightProps) {
    return (
        <text>
            {tokens.map((token, tokenIdx) => (
                <span key={tokenIdx} fg={TOKEN_COLORS[token.type] ?? Theme.colors.text}>
                    {token.value}
                </span>
            ))}
        </text>
    );
}
