import type { ReactNode } from "react";
import { Theme } from "../theme.ts";

type Dim = number | `${number}%` | "auto";

interface ModalBaseProps {
    title?: string;
    width?: Dim;
    height?: Dim;
    top?: Dim;
    left?: Dim;
    right?: Dim;
    bottom?: Dim;
    children: ReactNode;
}

export function ModalBase({
    title,
    width = "80%",
    height = "auto",
    top = 4,
    left = 4,
    right,
    bottom,
    children,
}: ModalBaseProps) {
    return (
        <box
            position="absolute"
            top={top}
            left={left}
            right={right}
            bottom={bottom}
            width={width}
            height={height}
            backgroundColor={Theme.overlay}
            border={true}
            borderStyle="rounded"
            borderColor={Theme.overlayTitle}
            padding={1}
            flexDirection="column"
            gap={1}
            zIndex={20}
        >
            {title && (
                <text fg={Theme.overlayTitle}>
                    <strong>{title}</strong>
                </text>
            )}
            <box flexDirection="column" gap={1} flexGrow={1}>
                {children}
            </box>
        </box>
    );
}
