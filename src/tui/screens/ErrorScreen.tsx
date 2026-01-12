import type { ScreenEntry } from "../context/NavigationContext.tsx";
import type { Routes } from "../routes.ts";
import { ResultsPanel } from "../components/ResultsPanel.tsx";

interface ErrorScreenProps {
    entry: ScreenEntry<Routes, "error">;
}

export function ErrorScreen({ entry }: ErrorScreenProps) {
    const { params } = entry;
    if (!params) return null;

    const { error, command } = params;

    return (
        <ResultsPanel
            result={null}
            error={error}
            focused={true}
            renderResult={command.renderResult}
        />
    );
}
