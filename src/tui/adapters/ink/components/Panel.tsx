import { Text } from "ink";
import type { PanelProps } from "../../../semantic/types.ts";

export function Panel({ title, children }: PanelProps) {
    return (
        <>
            {title ? (
                <Text bold>
                    {title}
                </Text>
            ) : null}
            {children}
        </>
    );
}
