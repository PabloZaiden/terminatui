import { useEffect, useId } from "react";
import { useClipboardContext, type ClipboardContent, type ClipboardProvider } from "../context/ClipboardContext.tsx";

/**
 * Hook for registering a clipboard provider.
 * The provider is automatically registered when mounted and unregistered when unmounted.
 * 
 * @param provider - Function that returns clipboard content or null
 * @param enabled - Whether the provider is active (default: true)
 * 
 * @example
 * ```tsx
 * // In a screen component
 * useClipboardProvider(() => ({
 *     content: JSON.stringify(values, null, 2),
 *     label: "Config"
 * }));
 * 
 * // In a modal that may or may not have content
 * useClipboardProvider(() => {
 *     if (!hasContent) return null;
 *     return { content: data, label: "Modal Data" };
 * });
 * ```
 */
export function useClipboardProvider(
    provider: ClipboardProvider,
    enabled: boolean = true
): void {
    const { register } = useClipboardContext();
    const id = useId();

    useEffect(() => {
        if (!enabled) return;

        const unregister = register(id, provider);
        return unregister;
    }, [id, provider, enabled, register]);
}

// Re-export types for convenience
export type { ClipboardContent, ClipboardProvider };
