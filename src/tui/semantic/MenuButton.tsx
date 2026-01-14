import type { MenuButtonProps } from "./types.ts";
import { useRenderer } from "../context/RendererContext.tsx";

export function MenuButton(props: MenuButtonProps) {
    const renderer = useRenderer();
    return renderer.components.MenuButton(props);
}
