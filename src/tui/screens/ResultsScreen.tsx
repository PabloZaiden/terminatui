import { useCallback } from "react";
import type { ScreenEntry } from "../context/NavigationContext.tsx";
import type { Routes } from "../routes.ts";
import type { CommandResult } from "../../core/command.ts";
import { ResultsPanel } from "../components/ResultsPanel.tsx";
import { useClipboardProvider } from "../hooks/useClipboardProvider.ts";

interface ResultsScreenProps {
    entry: ScreenEntry<Routes, "results">;
}

export function ResultsScreen({ entry }: ResultsScreenProps) {
    const { params } = entry;
    if (!params) return null;

    const { result, command } = params;

    // Register clipboard provider for this screen
    useClipboardProvider(
        useCallback(() => {
            if (command.getClipboardContent) {
                const custom = command.getClipboardContent(result as CommandResult);
                if (custom) return { content: custom, label: "Results" };
            }
            return { content: JSON.stringify(result, null, 2), label: "Results" };
        }, [result, command])
    );

    return (
        <ResultsPanel
            result={result as any}
            error={null}
            focused={true}
            renderResult={command.renderResult}
        />
    );
}
