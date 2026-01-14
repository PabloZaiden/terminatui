import type { SelectProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function Select<TValue extends string>(props: SelectProps<TValue>) {
    const renderer = useRenderer();
    return renderer.components.Select(props as any);
}
