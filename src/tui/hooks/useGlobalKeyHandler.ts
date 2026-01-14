import { useEffect, useRef } from "react";
import { useKeyboardContext, type GlobalKeyHandler } from "../context/KeyboardContext.tsx";

/**
 * Set the global keyboard handler.
 * 
 * The global handler receives ALL key events FIRST, before the active handler.
 * Use this for app-wide shortcuts like Ctrl+L (logs), Ctrl+Y (copy), Esc (back).
 * 
 * Return true from the handler if the key was handled (prevents active handler from receiving it).
 * 
 * Only ONE global handler is supported - typically set by the main app component.
 * 
 * @param handler - Callback invoked on all keyboard events. Return true if handled.
 * 
 * @example
 * ```tsx
 * // In TuiApp
 * useGlobalKeyHandler((event) => {
 *     const key = event;
 *     
 *     if (key.ctrl && key.name === "l") {
 *         toggleLogs();
 *         return true;
 *     }
 *     
 *     if (key.name === "escape") {
 *         handleBack();
 *         return true;
 *     }
 *     
 *     return false; // Let active handler process
 * });
 * ```
 */
export function useGlobalKeyHandler(handler: GlobalKeyHandler): void {
    const { setGlobalHandler } = useKeyboardContext();
    const handlerRef = useRef(handler);
    
    // Keep ref updated without triggering re-registration
    handlerRef.current = handler;

    useEffect(() => {
        // Set a stable wrapper that calls the current handler
        const unregister = setGlobalHandler((event) => handlerRef.current(event));

        return () => {
            unregister();
        };
    }, [setGlobalHandler]);
}

// Re-export types for convenience
export type { GlobalKeyHandler };
