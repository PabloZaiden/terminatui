import {
    createContext,
    useContext,
    useCallback,
    useRef,
    type ReactNode,
} from "react";
import { useKeyboard } from "@opentui/react";
import type { KeyEvent } from "@opentui/core";

/**
 * Keyboard event passed to handlers.
 */
export interface KeyboardEvent {
    /** The underlying OpenTUI KeyEvent */
    key: KeyEvent;
}

/**
 * Handler function for keyboard events.
 * Return true if the key was handled, false to let it propagate.
 */
export type KeyHandler = (event: KeyboardEvent) => boolean;

/**
 * Global handler that processes keys before the active handler.
 * Return true if the key was handled (stops propagation to active handler).
 */
export type GlobalKeyHandler = (event: KeyboardEvent) => boolean;

interface KeyboardContextValue {
    /**
     * Set the active handler (only one at a time - the topmost screen/modal).
     * Returns unregister function.
     */
    setActiveHandler: (id: string, handler: KeyHandler) => () => void;

    /**
     * Set the global handler (processed before active handler).
     * Only one global handler is supported.
     */
    setGlobalHandler: (handler: GlobalKeyHandler) => void;
}

const KeyboardContext = createContext<KeyboardContextValue | null>(null);

interface KeyboardProviderProps {
    children: ReactNode;
}

/**
 * Provider that coordinates keyboard handling with a simple model:
 * 1. Global handler processes keys first (for app-wide shortcuts like Ctrl+L, Ctrl+Y, Esc)
 * 2. If not handled, the active handler (topmost screen/modal) gets the key
 * 
 * Only ONE active handler is registered at a time - when a modal opens, it becomes
 * the active handler; when it closes, the previous handler is restored.
 */
export function KeyboardProvider({ children }: KeyboardProviderProps) {
    // Stack of handlers - topmost is active
    const handlerStackRef = useRef<{ id: string; handler: KeyHandler }[]>([]);
    const globalHandlerRef = useRef<GlobalKeyHandler | null>(null);

    const setActiveHandler = useCallback((id: string, handler: KeyHandler) => {
        // Remove existing handler with same id if present (for updates)
        handlerStackRef.current = handlerStackRef.current.filter((h) => h.id !== id);
        // Push to stack (most recent = active)
        handlerStackRef.current.push({ id, handler });

        // Return unregister function
        return () => {
            handlerStackRef.current = handlerStackRef.current.filter((h) => h.id !== id);
        };
    }, []);

    const setGlobalHandler = useCallback((handler: GlobalKeyHandler) => {
        globalHandlerRef.current = handler;
    }, []);

    // Single useKeyboard call that dispatches events
    useKeyboard((key: KeyEvent) => {
        const event: KeyboardEvent = { key };

        // 1. Global handler gets first chance
        if (globalHandlerRef.current) {
            const handled = globalHandlerRef.current(event);
            if (handled) {
                return;
            }
        }

        // 2. Active handler (topmost in stack) gets the key
        const activeHandler = handlerStackRef.current[handlerStackRef.current.length - 1];
        if (activeHandler) {
            activeHandler.handler(event);
        }
    });

    return (
        <KeyboardContext.Provider value={{ setActiveHandler, setGlobalHandler }}>
            {children}
        </KeyboardContext.Provider>
    );
}

/**
 * Access the keyboard context.
 * @throws Error if used outside of KeyboardProvider
 */
export function useKeyboardContext(): KeyboardContextValue {
    const context = useContext(KeyboardContext);
    if (!context) {
        throw new Error("useKeyboardContext must be used within a KeyboardProvider");
    }
    return context;
}
