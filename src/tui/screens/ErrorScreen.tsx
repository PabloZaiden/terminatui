import { useCallback } from "react";
import type { ScreenEntry } from "../context/NavigationContext.tsx";
import type { Routes } from "../routes.ts";
import { ResultsPanel } from "../components/ResultsPanel.tsx";
import { useClipboardProvider } from "../hooks/useClipboardProvider.ts";

interface ErrorScreenProps {
    entry: ScreenEntry<Routes, "error">;
}

export function ErrorScreen({ entry }: ErrorScreenProps) {
    const { params } = entry;
    if (!params) return null;

    const { error, command } = params;

    // Register clipboard provider for this screen
    useClipboardProvider(
        useCallback(() => ({
            content: error.message,
            label: "Error",
        }), [error])
    );

    return (
        <ResultsPanel
            result={null}
            error={error}
            focused={true}
            renderResult={command.renderResult}
        />
    );
}
