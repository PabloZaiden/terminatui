import type { ReactNode } from "react";
import type { CommandResult } from "../../../../core/command.ts";

// Platform-native components (OpenTUI)
import { Container } from "../components/Container.tsx";
import { Panel } from "../components/Panel.tsx";
import { ScrollView } from "../components/ScrollView.tsx";
import { Label } from "../components/Label.tsx";
import { Value } from "../components/Value.tsx";

// Shared utility for JSON highlighting
import { JsonHighlight } from "../../../components/JsonHighlight.tsx";

interface ResultsPanelProps {
    result: CommandResult | null;
    error: Error | null;
    focused: boolean;
    renderResult?: (result: CommandResult) => ReactNode;
}

export function ResultsPanel({ result, error, focused, renderResult }: ResultsPanelProps) {
    let content: ReactNode;

    if (error) {
        content = (
            <Container flexDirection="column" gap={1}>
                <Label color="error" bold>
                    Error
                </Label>
                <Label color="error">{error.message}</Label>
            </Container>
        );
    } else if (result) {
        if (renderResult) {
            const customContent = renderResult(result);
            if (typeof customContent === "string" || typeof customContent === "number" || typeof customContent === "boolean") {
                content = <Value>{String(customContent)}</Value>;
            } else {
                content = customContent as ReactNode;
            }
        } else {
            content = (
                <Container flexDirection="column" gap={1}>
                    {result.message && <Label color={result.success ? "success" : "error"}>{result.message}</Label>}
                    {result.data !== undefined && result.data !== null && (
                        typeof result.data === "object" 
                            ? <Value>{JsonHighlight({ value: result.data })}</Value>
                            : <Value>{String(result.data)}</Value>
                    )}
                </Container>
            );
        }
    } else {
        content = <Label color="mutedText">No results yet...</Label>;
    }

    return (
        <Panel title="Results" focused={focused} flex={1} padding={1} flexDirection="column">
            <ScrollView axis="vertical" flex={1} focused={focused}>
                <Container flexDirection="column">{content}</Container>
            </ScrollView>
        </Panel>
    );
}
