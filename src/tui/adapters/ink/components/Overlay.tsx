import type { OverlayProps } from "../../../semantic/layoutTypes.ts";
import { Box } from "ink";

export function Overlay({ children }: OverlayProps) {
    return (
        <Box flexDirection="column" flexGrow={1} justifyContent="center" alignItems="center">
            {children}
        </Box>
    );
}
