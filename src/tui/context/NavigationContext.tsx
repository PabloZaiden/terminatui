import {
    createContext,
    useContext,
    useState,
    useCallback,
    type ReactNode,
} from "react";

/**
 * Screen types representing different states/views in the TUI application.
 * Based on the Mode enum in TuiApp.tsx.
 */
export type Screen =
    | { type: "CommandSelect"; commandPath?: string[] }
    | { type: "Config"; commandName: string; commandPath: string[] }
    | { type: "Running"; commandName: string }
    | { type: "Results"; commandName: string; success: boolean }
    | { type: "Error"; commandName: string; error: Error };

/**
 * Navigation API for managing the screen stack.
 */
export interface NavigationAPI {
    /** Current screen at the top of the stack */
    currentScreen: Screen;
    /** All screens in the stack */
    stack: Screen[];
    /** Push a new screen onto the stack */
    push: (screen: Screen) => void;
    /** Pop the current screen from the stack (returns to previous screen) */
    pop: () => void;
    /** Replace the current screen with a new one */
    replace: (screen: Screen) => void;
    /** Reset the stack to a single screen */
    reset: (screen: Screen) => void;
    /** Check if we can go back (more than one screen in stack) */
    canGoBack: boolean;
}

const NavigationContext = createContext<NavigationAPI | null>(null);

interface NavigationProviderProps {
    /** Initial screen to display */
    initialScreen?: Screen;
    children: ReactNode;
}

/**
 * Provider that manages navigation state with a stack-based approach.
 * The stack never becomes empty - there's always at least one screen.
 */
export function NavigationProvider({
    initialScreen = { type: "CommandSelect" },
    children,
}: NavigationProviderProps) {
    // Stack is initialized with the initial screen and never becomes empty
    const [stack, setStack] = useState<Screen[]>([initialScreen]);

    const push = useCallback((screen: Screen) => {
        setStack((prev) => [...prev, screen]);
    }, []);

    const pop = useCallback(() => {
        setStack((prev) => {
            // Never allow the stack to become empty
            if (prev.length <= 1) {
                return prev;
            }
            return prev.slice(0, -1);
        });
    }, []);

    const replace = useCallback((screen: Screen) => {
        setStack((prev) => {
            // Replace the last screen with the new one
            if (prev.length === 0) {
                // This should never happen, but handle it gracefully
                return [screen];
            }
            return [...prev.slice(0, -1), screen];
        });
    }, []);

    const reset = useCallback((screen: Screen) => {
        // Reset to a single screen
        setStack([screen]);
    }, []);

    const currentScreen = stack[stack.length - 1]!;
    const canGoBack = stack.length > 1;

    const value: NavigationAPI = {
        currentScreen,
        stack,
        push,
        pop,
        replace,
        reset,
        canGoBack,
    };

    return (
        <NavigationContext.Provider value={value}>
            {children}
        </NavigationContext.Provider>
    );
}

/**
 * Hook to access the navigation API.
 * @throws Error if used outside of NavigationProvider
 */
export function useNavigation(): NavigationAPI {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error("useNavigation must be used within a NavigationProvider");
    }
    return context;
}
