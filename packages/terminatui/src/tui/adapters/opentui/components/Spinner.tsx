import type { SpinnerProps } from "../../../semantic/types.ts";
import { useSpinner } from "../../shared/useSpinner.ts";

export function Spinner({ active }: SpinnerProps) {
    const { frame } = useSpinner(active);

    if (!active) {
        return "";
    }

    return <text>{frame} </text>;
}
