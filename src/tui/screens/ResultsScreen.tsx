import type { ScreenEntry } from "../context/NavigationContext.tsx";
import type { Routes } from "../routes.ts";
import { ResultsPanel } from "../components/ResultsPanel.tsx";

interface ResultsScreenProps {
    entry: ScreenEntry<Routes, "results">;
}

export function ResultsScreen({ entry }: ResultsScreenProps) {
    const { params } = entry;
    if (!params) return null;

    const { result, command } = params;

    return (
        <ResultsPanel
            result={result as any}
            error={null}
            focused={true}
            renderResult={command.renderResult}
        />
    );
}
