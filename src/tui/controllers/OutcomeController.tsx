import type { CopyPayload, ErrorRouteParams, ResultsRouteParams, TuiRoute } from "../driver/types.ts";
import type { NavigationAPI } from "../context/NavigationContext.tsx";

import { RenderRunningScreen } from "../semantic/render.tsx";

export type OutcomeRoute = Extract<TuiRoute, "running" | "results" | "error">;

export class OutcomeController {
    #navigation: NavigationAPI;

    public constructor({ navigation }: { navigation: NavigationAPI }) {
        this.#navigation = navigation;
    }

    public render(route: OutcomeRoute): { node: React.ReactNode } {
        if (route === "running") {
            return { node: <RenderRunningScreen title="Running" kind="running" /> };
        }

        if (route === "results") {
            const params = this.#navigation.current.params as { result: unknown } | undefined;
            return {
                node: <RenderRunningScreen title="Results" kind="results" message={String(params?.result ?? "")} />,
            };
        }

        const params = this.#navigation.current.params as { error: Error } | undefined;
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
            const params = this.#navigation.current.params as ResultsRouteParams | undefined;
            if (params?.result !== undefined) {
                return {
                    label: "result",
                    content: String(params.result),
                };
            }
        }

        if (route === "error") {
            const params = this.#navigation.current.params as ErrorRouteParams | undefined;
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
