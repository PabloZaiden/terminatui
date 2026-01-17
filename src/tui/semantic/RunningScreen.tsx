import type { CommandResult } from "../../core/command.ts";

export interface RunningScreenProps {
    title: string;
    kind: "running" | "results" | "error";
    message?: string;
    /** The actual result object when kind is "results" */
    result?: CommandResult;
}

export function RunningScreen(_props: RunningScreenProps) {
    // Semantic-only marker component. Adapter renders this.
    return null;
}
