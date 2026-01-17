import { useTerminalDimensions } from "@opentui/react";
import { Label } from "../components/Label.tsx";
import { Overlay } from "../components/Overlay.tsx";
import { SemanticColors } from "../../../theme.ts";
import type { LogsScreenProps } from "../../../semantic/LogsScreen.tsx";

export function LogsPanel({ items }: LogsScreenProps) {
    const { width: terminalWidth, height: terminalHeight } = useTerminalDimensions();
    
    // Panel takes most of terminal size, leaving some margin to show it's a modal
    // ~90% width/height with minimum sizes
    const panelHeight = Math.max(10, Math.floor(terminalHeight * 0.85));
    const panelWidth = Math.max(40, Math.floor(terminalWidth * 0.85));
    
    // Scrollbox height = panel height - border (2) - padding (2) - title (1) - footer (1)
    const scrollboxHeight = panelHeight - 6;

    return (
        <Overlay>
            <box
                flexDirection="column"
                padding={1}
                border={true}
                borderStyle="rounded"
                borderColor={SemanticColors.warning}
                backgroundColor={SemanticColors.overlay}
                width={panelWidth}
                height={panelHeight}
            >
                <Label bold>Logs</Label>
                <scrollbox scrollY height={scrollboxHeight}>
                    <box flexDirection="column">
                        {items.map((item) => (
                            <Label color="value" key={item.timestamp}>
                                {`[${item.level}] ${Bun.stripANSI(item.message)}`}
                            </Label>
                        ))}
                    </box>
                </scrollbox>
                <Label color="mutedText">Enter or Esc to close</Label>
            </box>
        </Overlay>
    );
}
