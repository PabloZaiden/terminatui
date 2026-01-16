import { AppShell, type AppShellProps } from "./AppShell.tsx";
import { CommandBrowserScreen, type CommandBrowserScreenProps } from "./CommandBrowserScreen.tsx";
import { ConfigScreen, type ConfigScreenProps } from "./ConfigScreen.tsx";
import { RunningScreen, type RunningScreenProps } from "./RunningScreen.tsx";
import { LogsScreen, type LogsScreenProps } from "./LogsScreen.tsx";
import { EditorScreen, type EditorScreenProps } from "./EditorScreen.tsx";
import { useRenderer } from "../context/RendererContext.tsx";

export function RenderAppShell(props: AppShellProps) {
    const renderer = useRenderer();
    // Keep marker component in tree for debugging/introspection.
    void AppShell;
    return renderer.renderSemanticAppShell(props);
}

export function RenderCommandBrowserScreen(props: CommandBrowserScreenProps) {
    const renderer = useRenderer();
    void CommandBrowserScreen;
    return renderer.renderSemanticCommandBrowserScreen(props);
}

export function RenderConfigScreen(props: ConfigScreenProps) {
    const renderer = useRenderer();
    void ConfigScreen;
    return renderer.renderSemanticConfigScreen(props);
}

export function RenderRunningScreen(props: RunningScreenProps) {
    const renderer = useRenderer();
    void RunningScreen;
    return renderer.renderSemanticRunningScreen(props);
}

export function RenderLogsScreen(props: LogsScreenProps) {
    const renderer = useRenderer();
    void LogsScreen;
    return renderer.renderSemanticLogsScreen(props);
}

export function RenderEditorScreen(props: EditorScreenProps) {
    const renderer = useRenderer();
    void EditorScreen;
    return renderer.renderSemanticEditorScreen(props);
}
