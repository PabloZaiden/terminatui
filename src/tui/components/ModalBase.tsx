import type { ReactNode } from "react";
import { Panel } from "../semantic/Panel.tsx";
import { Container } from "../semantic/Container.tsx";
import { Label } from "../semantic/Label.tsx";

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
        <box position="absolute" top={0} left={0} right={0} bottom={0} zIndex={20}>
            <box position="absolute" top={top} left={left} right={right} bottom={bottom} width={width} height={height}>
                <Panel border={true} flexDirection="column" flex={1} padding={1} surface="overlay">
                    {title && (
                        <Label color="warning" bold>
                            {title}
                        </Label>
                    )}
                    <Container flexDirection="column" gap={1} flex={1}>
                        {children}
                    </Container>
                </Panel>
            </box>
        </box>
    );
}
