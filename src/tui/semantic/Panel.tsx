import type { PanelProps } from "./layoutTypes.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Panel(props: PanelProps) {
    const renderer = useRenderer();
    return renderer.components.Panel(props);
}
