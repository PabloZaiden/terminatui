import type { OverlayProps } from "./layoutTypes.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Overlay(props: OverlayProps) {
    const renderer = useRenderer();
    return renderer.components.Overlay(props);
}
