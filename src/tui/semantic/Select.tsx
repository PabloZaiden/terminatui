import type { SelectProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Select(props: SelectProps) {
    const renderer = useRenderer();
    return renderer.components.Select(props);
}
