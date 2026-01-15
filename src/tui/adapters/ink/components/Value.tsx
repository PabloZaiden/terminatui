import { Text } from "ink";
import type { ValueProps } from "../../../semantic/types.ts";
import { toPlainText } from "../utils.ts";

export function Value({ children }: ValueProps) {
    return <Text color="magenta">{toPlainText(children)}</Text>;
}
