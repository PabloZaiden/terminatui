import { tokenizeJsonValue } from "../../../utils/jsonTokenizer.ts";
import { Container } from "../components/Container.tsx";
import { CodeHighlight } from "../components/CodeHighlight.tsx";

export interface JsonHighlightProps {
    value: unknown;
}

export function JsonHighlight({ value }: JsonHighlightProps) {
    const lines = tokenizeJsonValue(value);
    return (
        <Container flexDirection="column" gap={0}>
            {lines.map((tokens, lineIdx) => (
                <CodeHighlight
                    key={`json-${lineIdx}`}
                    tokens={tokens.map((token) => ({ type: token.type, value: token.value }))}
                />
            ))}
        </Container>
    );
}
