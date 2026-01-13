import { useCallback } from "react";
import type { AnyCommand, CommandResult } from "../../core/command.ts";
import { useNavigation } from "../context/NavigationContext.tsx";
import { ResultsPanel } from "../components/ResultsPanel.tsx";
import { useClipboardProvider } from "../hooks/useClipboardProvider.ts";
import { type ScreenComponent } from "../registry.tsx";
import { ScreenBase } from "./ScreenBase.ts";

/**
 * Screen state stored in navigation params.
 */
interface ResultsParams {
    command: AnyCommand;
    commandPath: string[];
    values: Record<string, unknown>;
    result: unknown;
}

export class ResultsScreen extends ScreenBase {
    getRoute(): string {
        return "results";
    }
    /**
     * Results screen - shows command execution results.
     * Fully self-contained - gets all data from context and handles its own transitions.
     */
    override component(): ScreenComponent {
        return function ResultsScreenComponent() {
            const navigation = useNavigation();

            // Get params from navigation
            const params = navigation.current.params as ResultsParams | undefined;
            if (!params) return null;

            const { result, command } = params;

            // Register clipboard provider for this screen
            useClipboardProvider(
                useCallback(() => {
                    if (command.getClipboardContent) {
                        const custom = command.getClipboardContent(result as CommandResult);
                        if (custom) return { content: custom, label: "Results" };
                    }
                    return { content: JSON.stringify(result, null, 2), label: "Results" };
                }, [result, command])
            );

            return (
                <ResultsPanel
                    result={result as CommandResult | null}
                    error={null}
                    focused={true}
                    renderResult={command.renderResult}
                />
            );
        }
    }
}
