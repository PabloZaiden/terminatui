import type { AnyCommand } from "../../core/command.ts";
import type { NavigationAPI } from "../context/NavigationContext.tsx";
import type { ExecutorContextValue } from "../context/ExecutorContext.tsx";
import type { LogEvent } from "../../core/logger.ts";
import type { AppShellProps } from "../semantic/AppShell.tsx";

import { RenderAppShell } from "../semantic/render.tsx";

import type { ConfigRouteParams, CopyPayload, EditorModalParams, TuiRoute } from "./types.ts";
import { CommandBrowserController } from "../controllers/CommandBrowserController.tsx";
import { ConfigController } from "../controllers/ConfigController.tsx";
import { EditorController } from "../controllers/EditorController.tsx";
import { LogsController } from "../controllers/LogsController.tsx";
import { OutcomeController } from "../controllers/OutcomeController.tsx";

export class TuiDriver {
    private navigation: NavigationAPI;
    private executor: ExecutorContextValue;
    private logs: LogEvent[];

    private commandBrowser: CommandBrowserController;
    private config: ConfigController;
    private editor: EditorController;
    private logsModal: LogsController;
    private outcome: OutcomeController;

    public constructor({
        appName,
        commands,
        navigation,
        executor,
        logs,
    }: {
        appName: string;
        commands: AnyCommand[];
        navigation: NavigationAPI;
        executor: ExecutorContextValue;
        logs: LogEvent[];
    }) {
        this.navigation = navigation;
        this.executor = executor;
        this.logs = logs;

        this.config = new ConfigController({ appName, navigation, executor });
        this.commandBrowser = new CommandBrowserController({ commands, navigation, configController: this.config });
        this.editor = new EditorController({ navigation });
        this.logsModal = new LogsController({ navigation });
        this.outcome = new OutcomeController({ navigation });
    }

    public get statusMessage(): string {
        return this.executor.isExecuting ? "Executing..." : "Ready";
    }

    public getActiveCopyPayload(): CopyPayload | null {
        // Modal takes priority over screen - if a modal is open, use its copy payload
        const topModal = this.navigation.modalStack[this.navigation.modalStack.length - 1];
        if (topModal?.id === "logs") {
            return this.logsModal.getCopyPayload(this.logs);
        }

        if (topModal?.id === "editor") {
            return this.editor.getCopyPayload();
        }

        // No modal open, check current screen
        const currentRoute = this.navigation.current.route as TuiRoute;
        if (currentRoute === "config") {
            const params = this.navigation.current.params as ConfigRouteParams | undefined;
            if (params) {
                return this.config.getCopyPayload(params);
            }
        }

        if (currentRoute === "results" || currentRoute === "error") {
            return this.outcome.getCopyPayload(currentRoute);
        }

        return null;
    }

    public renderAppShell({
        app,
        copyToast,
    }: {
        app: { name: string; displayName?: string; version: string; breadcrumb?: string[] };
        copyToast?: string | null;
    }): React.ReactNode {
        const currentRoute = this.navigation.current.route as TuiRoute;

        const { screen, breadcrumb } = this.renderScreen(currentRoute);
        const modals = this.renderModals();

        return (
            <RenderAppShell
                app={{
                    name: app.name,
                    displayName: app.displayName,
                    version: app.version,
                    breadcrumb: breadcrumb ?? app.breadcrumb,
                }}
                status={{
                    isExecuting: this.executor.isExecuting,
                    isCancelling: this.executor.isCancelling,
                    message: this.statusMessage,
                }}
                screen={screen}
                modals={modals}
                copyToast={copyToast}
            />
        );
    }

    private renderScreen(route: TuiRoute): { screen: React.ReactNode; breadcrumb?: string[] } {
        if (route === "commandBrowser") {
            const { node, breadcrumb } = this.commandBrowser.render();
            return { screen: node, breadcrumb };
        }

        if (route === "config") {
            const { node, breadcrumb } = this.config.render();
            return { screen: node, breadcrumb };
        }

        if (route === "running" || route === "results" || route === "error") {
            const { node } = this.outcome.render(route);
            return { screen: node };
        }

        return { screen: null };
    }

    private renderModals(): AppShellProps["modals"] {
        const modals: React.ReactNode[] = this.navigation.modalStack.map((modal) => {
            if (modal.id === "logs") {
                return this.logsModal.render(this.logs);
            }

            if (modal.id === "editor") {
                return this.editor.render(modal.params as EditorModalParams | undefined);
            }

            return null;
        });

        return modals.filter(Boolean) as React.ReactNode[];
    }
}
