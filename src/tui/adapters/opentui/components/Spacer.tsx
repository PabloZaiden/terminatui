import type { SpacerProps } from "../../../semantic/types.ts";

export function Spacer({ size, axis = "vertical" }: SpacerProps) {
    return axis === "horizontal" ? <box width={size} flexShrink={0} /> : <box height={size} flexShrink={0} />;
}
