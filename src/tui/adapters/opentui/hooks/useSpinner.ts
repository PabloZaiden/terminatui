import { useEffect, useMemo, useState } from "react";

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];
const SPINNER_INTERVAL = 80;

interface UseSpinnerResult {
    frameIndex: number;
    frame: string;
}

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
