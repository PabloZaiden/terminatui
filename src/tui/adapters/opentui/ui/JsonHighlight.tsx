import { tokenizeJsonValue } from "../../../utils/jsonTokenizer.ts";
import { CodeHighlight } from "../components/CodeHighlight.tsx";

export interface JsonHighlightProps {
    value: unknown;
}

export function JsonHighlight({ value }: JsonHighlightProps) {
    const lines = tokenizeJsonValue(value);
    return (
        <box flexDirection="column" gap={0}>
            {lines.map((tokens, lineIdx) => (
                <CodeHighlight
                    key={`json-${lineIdx}`}
                    tokens={tokens.map((token) => ({ type: token.type, value: token.value }))}
                />
            ))}
        </box>
    );
}
