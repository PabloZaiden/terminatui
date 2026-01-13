import { useEffect, useId, useRef } from "react";
import {
    useKeyboardContext,
    type KeyHandler,
    type KeyboardEvent,
} from "../context/KeyboardContext.tsx";

interface UseActiveKeyHandlerOptions {
    /**
     * Whether the handler is currently enabled.
     * When false, the handler is unregistered.
     * @default true
     */
    enabled?: boolean;
}

/**
 * Register as the active keyboard handler.
 * 
 * Only ONE handler is active at a time - the most recently registered enabled handler.
 * When a modal opens and calls this hook, it becomes the active handler.
 * When it unmounts or becomes disabled, the previous handler is restored.
 * 
 * The handler receives keys AFTER global shortcuts (Ctrl+L, Ctrl+Y, Esc) are processed.
 * Return true from the handler if the key was handled.
 * 
 * @param handler - Callback invoked on keyboard events. Return true if handled.
 * @param options - Optional configuration (e.g., enabled flag).
 * 
 * @example
 * ```tsx
 * // In a screen component
 * useActiveKeyHandler((event) => {
 *     if (event.key.name === "return") {
 *         onSelect();
 *         return true;
 *     }
 *     return false;
 * });
 * 
 * // In a modal - becomes active when visible
 * useActiveKeyHandler(
 *     (event) => {
 *         if (event.key.name === "escape") {
 *             onClose();
 *             return true;
 *         }
 *         return false;
 *     },
 *     { enabled: visible }
 * );
 * ```
 */
export function useActiveKeyHandler(
    handler: KeyHandler,
    options: UseActiveKeyHandlerOptions = {}
): void {
    const { enabled = true } = options;
    const { setActiveHandler } = useKeyboardContext();
    const id = useId();
    const handlerRef = useRef(handler);
    
    // Keep ref updated without triggering re-registration
    handlerRef.current = handler;

    useEffect(() => {
        if (!enabled) {
            return;
        }

        // Register a stable wrapper that calls the current handler
        const unregister = setActiveHandler(id, (event) => handlerRef.current(event));
        return unregister;
    }, [id, enabled, setActiveHandler]);
}

// Re-export types for convenience
export type { KeyHandler, KeyboardEvent };
