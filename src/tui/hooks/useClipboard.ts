import { useCallback, useState } from "react";
import * as fs from "fs";


function copyWithOsc52(text: string): boolean {
    try {
        const cleanText = Bun.stripANSI(text);
        const base64 = Buffer.from(cleanText).toString("base64");
        const osc52 = `\x1b]52;c;${base64}\x07`;

        try {
            const fd = fs.openSync("/dev/tty", "w");
            fs.writeSync(fd, osc52);
            fs.closeSync(fd);
        } catch {
            process.stdout.write(osc52);
        }

        return true;
    } catch {
        return false;
    }
}

async function copyWithPbcopy(text: string): Promise<boolean> {
    try {
        const cleanText = Bun.stripANSI(text);
        const proc = Bun.spawn(["pbcopy"], {
            stdin: "pipe",
            stdout: "ignore",
            stderr: "ignore",
        });

        proc.stdin.write(cleanText);
        proc.stdin.end();

        const exitCode = await proc.exited;
        return exitCode === 0;
    } catch {
        return false;
    }
}

export async function copyToClipboard(text: string): Promise<boolean> {
    if (process.env["TERM_PROGRAM"] === "Apple_Terminal") {
        return await copyWithPbcopy(text);
    }

    return copyWithOsc52(text);
}

export interface UseClipboardResult {
    /** Copy text to clipboard */
    copy: (text: string) => boolean;
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
    
    const copy = useCallback((text: string): boolean => {
        void copyToClipboard(text);
        return true;
    }, []);

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

    return { copy, lastAction, setLastAction, copyWithMessage };
}
