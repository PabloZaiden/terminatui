import type { LabelProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Label(props: LabelProps) {
    const renderer = useRenderer();
    return renderer.components.Label(props);
}
