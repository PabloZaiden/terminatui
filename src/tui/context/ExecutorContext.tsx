import {
    createContext,
    useContext,
    useCallback,
    useState,
    useRef,
    type ReactNode,
} from "react";
import type { AnyCommand, CommandResult } from "../../core/command.ts";
import type { OptionSchema, OptionValues } from "../../types/command.ts";
import { AbortError } from "../../core/command.ts";

/**
 * Outcome of command execution.
 */
export interface ExecutionOutcome {
    success: boolean;
    result?: CommandResult;
    error?: Error;
    cancelled?: boolean;
}

/**
 * Executor context value - provides command execution capabilities to screens.
 */
export interface ExecutorContextValue {
    /** Whether a command is currently executing */
    isExecuting: boolean;
    /** Whether a cancellation has been requested */
    isCancelling: boolean;
    /** Execute a command with the given values */
    execute: (command: AnyCommand, values: Record<string, unknown>) => Promise<ExecutionOutcome>;
    /** Cancel the currently executing command */
    cancel: () => void;
    /** Reset executor state */
    reset: () => void;
}

const ExecutorContext = createContext<ExecutorContextValue | null>(null);

interface ExecutorProviderProps {
    children: ReactNode;
}

/**
 * Provider that gives screens access to command execution capabilities.
 * Screens can execute commands, check execution state, and cancel execution.
 */
export function ExecutorProvider({ children }: ExecutorProviderProps) {
    const [isExecuting, setIsExecuting] = useState(false);
    const [isCancelling, setIsCancelling] = useState(false);
    const abortControllerRef = useRef<AbortController | null>(null);

    const execute = useCallback(async (
        command: AnyCommand,
        values: Record<string, unknown>
    ): Promise<ExecutionOutcome> => {
        // Cancel any previous execution
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        const abortController = new AbortController();
        abortControllerRef.current = abortController;

        setIsExecuting(true);

        try {
            // Build config if command supports it
            let configOrValues: unknown = values;
            if (command.buildConfig) {
                configOrValues = await command.buildConfig(values as OptionValues<OptionSchema>);
            }

            // Execute the command
            const result = await command.execute(
                configOrValues as OptionValues<OptionSchema>,
                { signal: abortController.signal }
            );

            // Check if aborted during execution
            if (abortController.signal.aborted) {
                return { success: false, cancelled: true };
            }

            return {
                success: true,
                result: result as CommandResult | undefined,
            };
        } catch (e) {
            // Check for cancellation
            if (
                abortController.signal.aborted ||
                e instanceof AbortError ||
                (e instanceof Error && e.name === "AbortError")
            ) {
                return { success: false, cancelled: true };
            }

            const error = e instanceof Error ? e : new Error(String(e));
            return { success: false, error };
        } finally {
            setIsExecuting(false);
            setIsCancelling(false);
            if (abortControllerRef.current === abortController) {
                abortControllerRef.current = null;
            }
        }
    }, []);

    const cancel = useCallback(() => {
        if (abortControllerRef.current) {
            setIsCancelling(true);
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
    }, []);

    const reset = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            abortControllerRef.current = null;
        }
        setIsExecuting(false);
        setIsCancelling(false);
    }, []);

    return (
        <ExecutorContext.Provider value={{ isExecuting, isCancelling, execute, cancel, reset }}>
            {children}
        </ExecutorContext.Provider>
    );
}

/**
 * Access the executor context.
 * @throws Error if used outside of ExecutorProvider
 */
export function useExecutor(): ExecutorContextValue {
    const context = useContext(ExecutorContext);
    if (!context) {
        throw new Error("useExecutor must be used within an ExecutorProvider");
    }
    return context;
}
