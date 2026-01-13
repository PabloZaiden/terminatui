import type { ReactNode } from "react";
import type { OverlayProps } from "../../../semantic/types.ts";
import { Theme } from "../../../theme.ts";

export function Overlay({ zIndex = 10, dim, children }: OverlayProps & { children?: ReactNode }) {
    return (
        <box
            position="absolute"
            top={0}
            left={0}
            right={0}
            bottom={0}
            zIndex={zIndex}
            backgroundColor={dim ? Theme.colors.background : undefined}
        >
            {children}
        </box>
    );
}
