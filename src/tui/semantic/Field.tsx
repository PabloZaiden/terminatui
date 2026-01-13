import type { FieldProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Field(props: FieldProps) {
    const renderer = useRenderer();
    return renderer.components.Field(props);
}
