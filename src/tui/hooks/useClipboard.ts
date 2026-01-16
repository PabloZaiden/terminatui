import { useCallback, useState } from "react";
import { copyToTerminalClipboard } from "../adapters/shared/TerminalClipboard.ts";

export async function copyToClipboard(text: string): Promise<boolean> {
    return copyToTerminalClipboard(text);
}

export interface UseClipboardResult {
    /** Last action message for status display */
    lastAction: string;
    /** Set the last action message */
    setLastAction: (action: string) => void;
    /** Copy and set a success message */
    copyWithMessage: (text: string, label: string) => void;
}

/**
 * Hook for clipboard operations using OSC 52.
 * Works in most modern terminal emulators.
 */
export function useClipboard(): UseClipboardResult {
    const [lastAction, setLastAction] = useState("");

    const copyWithMessage = useCallback((text: string, label: string) => {
        void (async () => {
            const success = await copyToClipboard(text);
            if (!success) {
                return;
            }

            setLastAction(`✓ ${label} copied to clipboard`);
            setTimeout(() => setLastAction(""), 2000);
        })();
    }, []);

    return { lastAction, setLastAction, copyWithMessage };
}
