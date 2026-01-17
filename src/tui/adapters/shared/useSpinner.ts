import { useEffect, useMemo, useState } from "react";

const SPINNER_FRAMES = ["\u280B", "\u2819", "\u2839", "\u2838", "\u283C", "\u2834", "\u2826", "\u2827", "\u2807", "\u280F"];
const SPINNER_INTERVAL = 80;

interface UseSpinnerResult {
    frameIndex: number;
    frame: string;
}

/**
 * Shared spinner animation hook for terminal adapters.
 * Returns the current frame character to display.
 */
export function useSpinner(active: boolean): UseSpinnerResult {
    const [frameIndex, setFrameIndex] = useState(0);

    useEffect(() => {
        if (!active) {
            setFrameIndex(0);
            return;
        }

        const interval = setInterval(() => {
            setFrameIndex((prev) => {
                if (prev >= Number.MAX_SAFE_INTEGER / 2) {
                    return 0;
                }
                return prev + 1;
            });
        }, SPINNER_INTERVAL);

        return () => clearInterval(interval);
    }, [active]);

    const frame = useMemo(() => {
        return SPINNER_FRAMES[frameIndex % SPINNER_FRAMES.length]!;
    }, [frameIndex]);

    return { frameIndex, frame };
}
