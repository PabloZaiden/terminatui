import type { ButtonProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Button(props: ButtonProps) {
    const renderer = useRenderer();
    return renderer.components.Button(props);
}
