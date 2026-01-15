import { Text } from "ink";
import type { CodeProps } from "../../../semantic/types.ts";

export function Code({ children }: CodeProps) {
    return <Text color="gray">{children}</Text>;
}
