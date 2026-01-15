import type { MenuItemProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function MenuItem(props: MenuItemProps) {
    const renderer = useRenderer();
    return renderer.components.MenuItem(props);
}
