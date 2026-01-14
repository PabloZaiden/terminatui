import type { CodeHighlightProps, CodeTokenType } from "../../../semantic/types.ts";
import { SemanticColors } from "../../../theme.ts";

const TOKEN_COLORS: Record<CodeTokenType, string> = {
    key: SemanticColors.primary,
    string: SemanticColors.success,
    number: "#d19a66",
    boolean: "#c678dd",
    null: "#c678dd",
    punctuation: SemanticColors.mutedText,
    unknown: SemanticColors.text,
};

export function CodeHighlight({ tokens }: CodeHighlightProps) {
    return (
        <text>
            {tokens.map((token, tokenIdx) => (
                <span key={tokenIdx} fg={TOKEN_COLORS[token.type] ?? SemanticColors.text}>
                    {token.value}
                </span>
            ))}
        </text>
    );
}
