import {
    createContext,
    useContext,
    type ReactNode,
} from "react";
import type { AnyCommand } from "../../core/command.ts";

/**
 * App-level context value - provides app info and commands to screens.
 */
export interface TuiAppContextValue {
    /** Application name (used for persistence keys, CLI commands, etc.) */
    name: string;
    /** Display name for the header */
    displayName?: string;
    /** Application version */
    version: string;
    /** All available commands */
    commands: AnyCommand[];
    /** Exit the TUI application */
    onExit: () => void;
}

const TuiAppContext = createContext<TuiAppContextValue | null>(null);

interface TuiAppContextProviderProps extends TuiAppContextValue {
    children: ReactNode;
}

/**
 * Provider that gives screens access to app-level information.
 */
export function TuiAppContextProvider({
    children,
    name,
    displayName,
    version,
    commands,
    onExit,
}: TuiAppContextProviderProps) {
    return (
        <TuiAppContext.Provider value={{ name, displayName, version, commands, onExit }}>
            {children}
        </TuiAppContext.Provider>
    );
}

/**
 * Access the TUI app context.
 * @throws Error if used outside of TuiAppContextProvider
 */
export function useTuiApp(): TuiAppContextValue {
    const context = useContext(TuiAppContext);
    if (!context) {
        throw new Error("useTuiApp must be used within a TuiAppContextProvider");
    }
    return context;
}
