import type { SpinnerProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Spinner(props: SpinnerProps) {
    const renderer = useRenderer();
    return renderer.components.Spinner(props);
}
