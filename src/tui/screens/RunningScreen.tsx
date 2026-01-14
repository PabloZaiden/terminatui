import { useCallback } from "react";
import type { AnyCommand } from "../../core/command.ts";
import { useNavigation } from "../context/NavigationContext.tsx";
import { useExecutor } from "../context/ExecutorContext.tsx";
import { useBackHandler } from "../hooks/useBackHandler.ts";
import type { ScreenComponent } from "../registry.ts";
import { ScreenBase } from "./ScreenBase.ts";
import { Container } from "../semantic/Container.tsx";
import { Label } from "../semantic/Label.tsx";
import { Panel } from "../semantic/Panel.tsx";

/**
 * Screen state stored in navigation params.
 */
export interface RunningParams {
    command: AnyCommand;
    commandPath: string[];
    values: Record<string, unknown>;
}

/**
 * Running screen - shows while a command is executing.
 * Fully self-contained - gets all data from context and handles its own transitions.
 */
export class RunningScreen extends ScreenBase {
    static readonly Id = "running";
    getRoute(): string {
        return RunningScreen.Id;
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
                <Panel
                    flexDirection="column"
                    flex={1}
                    title={`Running ${command.displayName ?? command.name}`}
                    padding={1}
                    focused
                >
                    <Container flexDirection="column" flex={1} gap={1}>
                        <Label color="mutedText">
                            Check logs for progress.
                        </Label>
                        <Label color="mutedText">Press Esc to cancel.</Label>
                    </Container>
                </Panel>
            );
        };
    }
}
