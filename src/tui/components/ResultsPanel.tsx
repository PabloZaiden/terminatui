import type { ReactNode } from "react";
import { Theme } from "../theme.ts";
import type { CommandResult } from "../../core/command.ts";
import { Container } from "../semantic/Container.tsx";
import { Panel } from "../semantic/Panel.tsx";
import { ScrollView } from "../semantic/ScrollView.tsx";

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
                <text fg={Theme.error}>
                    <strong>Error</strong>
                </text>
                <text fg={Theme.error}>
                    {error.message}
                </text>
            </Container>
        );
    } else if (result) {
        if (renderResult) {
            const customContent = renderResult(result);

            if (typeof customContent === "string" || typeof customContent === "number" || typeof customContent === "boolean") {
                // Wrap primitive results so the renderer gets a text node
                content = (
                    <text fg={Theme.value}>
                        {String(customContent)}
                    </text>
                );
            } else {
                content = customContent as ReactNode;
            }
        } else {
            // Default JSON display
            content = (
            <Container flexDirection="column" gap={1}>
                    {result.message && (
                        <text fg={result.success ? Theme.success : Theme.error}>
                            {result.message}
                        </text>
                    )}
                    {result.data !== undefined && result.data !== null && (
                        <text fg={Theme.value}>
                            {JSON.stringify(result.data, null, 2)}
                        </text>
                    )}
            </Container>
            );
        }
    } else {
        content = (
            <text fg={Theme.label}>No results yet...</text>
        );
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
