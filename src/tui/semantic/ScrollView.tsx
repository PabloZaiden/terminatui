import type { ScrollViewProps, ScrollViewRef } from "./layoutTypes.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function ScrollView(props: ScrollViewProps) {
    const renderer = useRenderer();
    return renderer.components.ScrollView(props);
}

export type { ScrollViewRef };
