import type { ReactNode } from "react";
import type { OverlayProps } from "../../../semantic/types.ts";

export function Overlay({
    zIndex = 10,
    dim: _dim,
    top,
    left,
    right,
    bottom,
    width,
    height,
    children,
}: OverlayProps & { children?: ReactNode }) {
    return (
        <box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={zIndex}>
            {top !== undefined || left !== undefined || right !== undefined || bottom !== undefined || width !== undefined || height !== undefined ? (
                <box position="absolute" top={top as any} left={left as any} right={right as any} bottom={bottom as any} width={width as any} height={height as any}>
                    {children}
                </box>
            ) : (
                children
            )}
        </box>
    );
}
