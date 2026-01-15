import type { ReactNode } from "react";
import type { CommandResult } from "../../core/command.ts";
import { Container } from "../semantic/Container.tsx";
import { Panel } from "../semantic/Panel.tsx";
import { ScrollView } from "../semantic/ScrollView.tsx";
import { Label } from "../semantic/Label.tsx";
import { Value } from "../semantic/Value.tsx";

interface ResultsPanelProps {
    /** The result to display */
    result: CommandResult | null;
    /** Error to display (if any) */
    error: Error | null;
    /** Whether the panel is focused */
    focused: boolean;
    /** Custom result renderer */
    renderResult?: (result: CommandResult) => ReactNode;
}

/**
 * Panel displaying command execution results.
 */
export function ResultsPanel({
    result,
    error,
    focused,
    renderResult,
}: ResultsPanelProps) {

    // Determine content to display
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
                // Wrap primitive results so the renderer gets a text node
                content = <Value>{String(customContent)}</Value>;
            } else {
                content = customContent as ReactNode;
            }
        } else {
            // Default JSON display
            content = (
                <Container flexDirection="column" gap={1}>
                    {result.message && (
                        <Label color={result.success ? "success" : "error"}>{result.message}</Label>
                    )}
                    {result.data !== undefined && result.data !== null && (
                        <Value>{JSON.stringify(result.data, null, 2)}</Value>
                    )}
                </Container>
            );
        }
    } else {
        content = <Label color="mutedText">No results yet...</Label>;
    }

    return (
        <Panel
            title="Results"
            focused={focused}
            flex={1}
            padding={1}
            flexDirection="column"
        >
            <ScrollView axis="vertical" flex={1} focused={focused}>
                <Container flexDirection="column">
                    {content}
                </Container>
            </ScrollView>
        </Panel>
    );
}
