export interface RunningScreenProps {
    title: string;
    kind: "running" | "results" | "error";
    message?: string;
}

export function RunningScreen(_props: RunningScreenProps) {
    // Semantic-only marker component. Adapter renders this.
    return null;
}
