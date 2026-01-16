import { createContext, useContext, useRef, useCallback, type ReactNode } from "react";

/**
 * Clipboard content that can be provided by a screen or modal.
 */
export interface ClipboardContent {
    content: string;
    label: string;
}

/**
 * Provider function that returns clipboard content or null.
 */
export type ClipboardProvider = () => ClipboardContent | null;

export interface ClipboardContextValue {
    /**
     * Register a clipboard provider. Returns an unregister function.
     * Providers are stacked - the most recently registered provider is checked first.
     */
    register: (id: string, provider: ClipboardProvider) => () => void;

    /**
     * Get clipboard content from the topmost provider that returns content.
     */
    getContent: () => ClipboardContent | null;
}

const ClipboardContext = createContext<ClipboardContextValue | null>(null);

interface ClipboardProviderProps {
    children: ReactNode;
}

/**
 * Provider that manages clipboard content providers from screens and modals.
 * Providers are stacked - modals register on top of screens, so modal content
 * takes precedence when copying.
 */
export function ClipboardProviderComponent({ children }: ClipboardProviderProps) {
    const providersRef = useRef<Map<string, ClipboardProvider>>(new Map());
    const orderRef = useRef<string[]>([]);

    const register = useCallback((id: string, provider: ClipboardProvider) => {
        providersRef.current.set(id, provider);
        // Add to end (most recent)
        orderRef.current = orderRef.current.filter((i) => i !== id);
        orderRef.current.push(id);

        return () => {
            providersRef.current.delete(id);
            orderRef.current = orderRef.current.filter((i) => i !== id);
        };
    }, []);

    const getContent = useCallback((): ClipboardContent | null => {
        // Check providers in reverse order (most recent first)
        for (let i = orderRef.current.length - 1; i >= 0; i--) {
            const id = orderRef.current[i];
            const provider = providersRef.current.get(id!);
            if (provider) {
                const content = provider();
                if (content) {
                    return content;
                }
            }
        }
        return null;
    }, []);

    return (
        <ClipboardContext.Provider value={{ register, getContent }}>
            {children}
        </ClipboardContext.Provider>
    );
}

/**
 * Access the clipboard context.
 */
export function useClipboardContext(): ClipboardContextValue {
    const context = useContext(ClipboardContext);
    if (!context) {
        throw new Error("useClipboardContext must be used within a ClipboardProviderComponent");
    }
    return context;
}
