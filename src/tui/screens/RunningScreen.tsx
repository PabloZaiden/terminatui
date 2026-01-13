import { useCallback } from "react";
import type { AnyCommand } from "../../core/command.ts";
import { useNavigation } from "../context/NavigationContext.tsx";
import { useExecutor } from "../context/ExecutorContext.tsx";
import { useBackHandler } from "../hooks/useBackHandler.ts";
import type { ScreenComponent } from "../registry.tsx";
import { Theme } from "../theme.ts";
import { ScreenBase } from "./ScreenBase.ts";

/**
 * Screen state stored in navigation params.
 */
interface RunningParams {
    command: AnyCommand;
    commandPath: string[];
    values: Record<string, unknown>;
}

/**
 * Running screen - shows while a command is executing.
 * Fully self-contained - gets all data from context and handles its own transitions.
 */
export class RunningScreen extends ScreenBase {
    getRoute(): string {
        return "running";
    }

    override component(): ScreenComponent {
        return function RunningScreenComponent() {
            const navigation = useNavigation();
            const executor = useExecutor();
            
            // Get params from navigation
            const params = navigation.current.params as RunningParams | undefined;
            if (!params) return null;
            
            const { command } = params;

            // Register back handler - cancel execution on back
            useBackHandler(useCallback(() => {
                if (executor.isExecuting) {
                    executor.cancel();
                    executor.reset();
                    // Pop back to config screen
                    navigation.pop();
                    return true;
                }
                return false;
            }, [executor, navigation]));

            return (
                <box flexDirection="column" flexGrow={1} gap={1}>
                    <text fg={Theme.statusText}>
                        Running {command.displayName ?? command.name}... Check logs for progress.
                    </text>
                    <text fg={Theme.statusText}>Press Esc to cancel.</text>
                </box>
            );
        };
    }
}
