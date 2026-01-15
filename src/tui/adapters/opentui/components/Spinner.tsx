import type { SpinnerProps } from "../../../semantic/types.ts";
import { useSpinner } from "../hooks/useSpinner.ts";

export function Spinner({ active }: SpinnerProps) {
    const { frame } = useSpinner(active);

    if (!active) {
        return "";
    }

    return `${frame} `;
}
