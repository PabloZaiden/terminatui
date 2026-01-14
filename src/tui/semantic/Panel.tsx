import type { PanelProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Panel(props: PanelProps) {
    const renderer = useRenderer();
    return renderer.components.Panel(props);
}
