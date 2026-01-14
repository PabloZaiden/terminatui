import type { SpacerProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Spacer(props: SpacerProps) {
    const renderer = useRenderer();
    return renderer.components.Spacer(props);
}
