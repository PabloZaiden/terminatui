import type { TextInputProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function TextInput(props: TextInputProps) {
    const renderer = useRenderer();
    return renderer.components.TextInput(props);
}
