import {
    createContext,
    useContext,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    type ReactNode,
} from "react";
import type { KeyboardAdapter, KeyboardEvent, KeyHandler } from "../adapters/types.ts";

declare const globalThis: {
    __tuiRendererKeyboard?: KeyboardAdapter;
};

function useRendererKeyboard(): KeyboardAdapter {
    const keyboard = globalThis.__tuiRendererKeyboard;
    if (!keyboard) {
        throw new Error("KeyboardProvider used before renderer keyboard installed");
    }
    return keyboard;
}


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
    const keyboard = useRendererKeyboard();

    const handlerStackRef = useRef<{ id: string; handler: KeyHandler }[]>([]);
    const globalHandlerRef = useRef<GlobalKeyHandler | null>(null);

    const setActiveHandler = useCallback((id: string, handler: KeyHandler) => {
        handlerStackRef.current = handlerStackRef.current.filter((h) => h.id !== id);
        handlerStackRef.current.push({ id, handler });

        return () => {
            handlerStackRef.current = handlerStackRef.current.filter((h) => h.id !== id);
        };
    }, []);

    const setGlobalHandler = useCallback((handler: GlobalKeyHandler) => {
        globalHandlerRef.current = handler;
    }, []);

    useEffect(() => {
        keyboard.setGlobalHandler((event: KeyboardEvent) => {
            if (globalHandlerRef.current?.(event)) {
                return true;
            }

            const activeHandler = handlerStackRef.current[handlerStackRef.current.length - 1];
            if (activeHandler) {
                return activeHandler.handler(event);
            }

            return false;
        });
    }, [keyboard]);

    const value = useMemo<KeyboardContextValue>(
        () => ({ setActiveHandler, setGlobalHandler }),
        [setActiveHandler, setGlobalHandler]
    );

    return (
        <KeyboardContext.Provider value={value}>
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
