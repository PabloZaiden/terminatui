import type { ScreenEntry, NavigationAPI } from "../context/NavigationContext.tsx";
import type { Routes, Modals } from "../routes.ts";
import { Theme } from "../theme.ts";

interface RunningScreenProps {
    entry: ScreenEntry<Routes, "running">;
    navigation: NavigationAPI<Routes, Modals>;
}

export function RunningScreen({ entry }: RunningScreenProps) {
    const { params } = entry;
    if (!params) return null;

    return (
        <box flexDirection="column" flexGrow={1} gap={1}>
            <text fg={Theme.statusText}>
                Running {params.command.displayName ?? params.command.name}... Check logs for progress.
            </text>
            <text fg={Theme.statusText}>Press Esc to cancel.</text>
        </box>
    );
}
