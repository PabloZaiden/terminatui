import type { CodeHighlightProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function CodeHighlight(props: CodeHighlightProps) {
    const renderer = useRenderer();
    return renderer.components.CodeHighlight(props);
}
