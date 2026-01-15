import { Text } from "ink";
import type { CodeHighlightProps } from "../../../semantic/types.ts";

export function CodeHighlight({ tokens }: CodeHighlightProps) {
    return <Text>{tokens.map((t) => t.value).join("")}</Text>;
}
