import type { ContainerProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Container(props: ContainerProps) {
    const renderer = useRenderer();
    return renderer.components.Container(props);
}
