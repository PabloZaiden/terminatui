import { Text } from "ink";
import type { SpacerProps } from "../../../semantic/types.ts";

export function Spacer({ size, axis }: SpacerProps) {
    if (axis === "horizontal") {
        return <Text>{" ".repeat(size)}</Text>;
    }
    return (
        <>
            {Array.from({ length: size }).map((_, idx) => (
                <Text key={idx} />
            ))}
        </>
    );
}
