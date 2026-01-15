import type { CodeProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Code(props: CodeProps) {
    const renderer = useRenderer();
    return renderer.components.Code(props);
}
