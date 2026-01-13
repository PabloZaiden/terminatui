import { useCallback } from "react";
import type { AnyCommand } from "../../core/command.ts";
import { useNavigation } from "../context/NavigationContext.tsx";
import { ResultsPanel } from "../components/ResultsPanel.tsx";
import { useClipboardProvider } from "../hooks/useClipboardProvider.ts";
import type { ScreenComponent } from "../registry.tsx";
import { ScreenBase } from "./ScreenBase.ts";

/**
 * Screen state stored in navigation params.
 */
interface ErrorParams {
    command: AnyCommand;
    commandPath: string[];
    values: Record<string, unknown>;
    error: Error;
}

/**
 * Error screen - shows command execution errors.
 * Fully self-contained - gets all data from context and handles its own transitions.
 */
export class ErrorScreen extends ScreenBase {
    getRoute(): string {
        return "error";
    }

    override component(): ScreenComponent {
        return function ErrorScreenComponent() {
            const navigation = useNavigation();
            
            // Get params from navigation
            const params = navigation.current.params as ErrorParams | undefined;
            if (!params) return null;
            
            const { error, command } = params;

            // Register clipboard provider for this screen
            useClipboardProvider(
                useCallback(() => ({
                    content: error.message,
                    label: "Error",
                }), [error])
            );

            return (
                <ResultsPanel
                    result={null}
                    error={error}
                    focused={true}
                    renderResult={command.renderResult}
                />
            );
        };
    }
}
