import type { SpinnerProps } from "../../../semantic/types.ts";

export function Spinner({ active }: SpinnerProps) {
    //const { frame } = useSpinner(active);

    if (!active) {
        return null;
    }

    return <></>;
}
