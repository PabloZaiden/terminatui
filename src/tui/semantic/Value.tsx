import type { ValueProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Value(props: ValueProps) {
    const renderer = useRenderer();
    return renderer.components.Value(props);
}
