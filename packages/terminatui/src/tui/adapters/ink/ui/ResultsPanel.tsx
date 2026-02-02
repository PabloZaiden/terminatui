import type { ReactNode } from "react";
import { Box } from "ink";
import type { CommandResult } from "../../../../core/command.ts";

// Platform-native components (Ink)
import { Panel } from "../components/Panel.tsx";
import { ScrollView } from "../components/ScrollView.tsx";
import { Label } from "../components/Label.tsx";

// Adapter-local JSON highlighting
import { JsonHighlight } from "./JsonHighlight.tsx";

interface ResultsPanelProps {
    result: CommandResult | null;
    error: Error | null;
    focused: boolean;
    renderResult?: (result: CommandResult) => ReactNode;
}

export function ResultsPanel({ result, error, focused }: ResultsPanelProps) {
    let content: ReactNode;

    if (error) {
        content = (
            <Box flexDirection="column" gap={1}>
                <Label color="error" bold>
                    Error
                </Label>
                <Label color="error">{error.message}</Label>
            </Box>
        );
    } else if (result) {
        // for now we ignore renderResult in ink version
        
        content = (
            <Box flexDirection="column" gap={1}>
                {result.message && <Label color={result.success ? "success" : "error"}>{result.message}</Label>}
                {result.data !== undefined && result.data !== null && (
                    typeof result.data === "object"
                        ? <JsonHighlight value={result.data} />
                        : <Label color="value">{String(result.data)}</Label>
                )}
            </Box>
        );

    } else {
        content = <Label color="mutedText">No results yet...</Label>;
    }

    return (
        <Panel title="Results" focused={focused} flex={1} padding={1} flexDirection="column">
            <ScrollView axis="vertical" flex={1} focused={focused}>
                <Box flexDirection="column">{content}</Box>
            </ScrollView>
        </Panel>
    );
}
