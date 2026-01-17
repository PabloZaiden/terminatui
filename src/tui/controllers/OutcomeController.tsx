import type { CommandResult } from "../../core/command.ts";
import type { CopyPayload, ErrorRouteParams, ResultsRouteParams, TuiRoute } from "../driver/types.ts";
import type { NavigationAPI } from "../context/NavigationContext.tsx";

import { RenderRunningScreen } from "../semantic/render.tsx";

export type OutcomeRoute = Extract<TuiRoute, "running" | "results" | "error">;

export class OutcomeController {
    private navigation: NavigationAPI;

    public constructor({ navigation }: { navigation: NavigationAPI }) {
        this.navigation = navigation;
    }

    public render(route: OutcomeRoute): { node: React.ReactNode } {
        if (route === "running") {
            return { node: <RenderRunningScreen title="Waiting for results..." kind="running" /> };
        }

        if (route === "results") {
            const params = this.navigation.current.params as ResultsRouteParams | undefined;
            const result = params?.result as CommandResult | undefined;
            const command = params?.command;
            
            // Check if command has a custom result renderer
            let customContent: React.ReactNode = undefined;
            if (result && command?.renderResult) {
                try {
                    customContent = command.renderResult(result);
                } catch {
                    // If custom renderer fails, fall back to default display
                    customContent = undefined;
                }
            }

            return {
                node: (
                    <RenderRunningScreen
                        title="Results"
                        kind="results"
                        message={result?.message}
                        result={result}
                        customContent={customContent}
                    />
                ),
            };
        }

        const params = this.navigation.current.params as { error: Error } | undefined;
        return {
            node: (
                <RenderRunningScreen
                    title="Error"
                    kind="error"
                    message={String(params?.error?.message ?? "Unknown error")}
                />
            ),
        };
    }

    public getCopyPayload(route: OutcomeRoute): CopyPayload | null {
        if (route === "results") {
            const params = this.navigation.current.params as ResultsRouteParams | undefined;
            const result = params?.result as CommandResult | undefined;
            const command = params?.command;
            
            // Check if command has a custom clipboard content provider
            if (result && command?.getClipboardContent) {
                try {
                    const content = command.getClipboardContent(result);
                    if (content !== undefined) {
                        return { label: "result", content };
                    }
                } catch {
                    // Fall through to default behavior
                }
            }

            if (result !== undefined) {
                // If result has data, stringify it for clipboard
                if (result.data !== undefined) {
                    return {
                        label: "result",
                        content: typeof result.data === "object" 
                            ? JSON.stringify(result.data, null, 2) 
                            : String(result.data),
                    };
                }
                // Otherwise use the message
                return {
                    label: "result",
                    content: result.message ?? "",
                };
            }
        }

        if (route === "error") {
            const params = this.navigation.current.params as ErrorRouteParams | undefined;
            if (params?.error) {
                return {
                    label: "error",
                    content: params.error.message ?? String(params.error),
                };
            }
        }

        return null;
    }
}
