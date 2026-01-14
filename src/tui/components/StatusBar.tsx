import { Label } from "../semantic/Label.tsx";
import { Panel } from "../semantic/Panel.tsx";
import { Container } from "../semantic/Container.tsx";
import { useSpinner } from "../hooks/useSpinner.ts";

interface StatusBarProps {
    /** Status message to display */
    status: string;
    /** Whether the app is currently running a command */
    isRunning?: boolean;
    /** Whether to show keyboard shortcuts */
    showShortcuts?: boolean;
    /** Custom shortcuts string (defaults to standard shortcuts) */
    shortcuts?: string;
}

/**
 * Status bar showing current status, spinner, and keyboard shortcuts.
 */
export function StatusBar({
    status,
    isRunning = false,
    showShortcuts = true,
    shortcuts = "L Logs • C CLI • Tab Switch • Ctrl+Y Copy • Esc Back",
}: StatusBarProps) {
    const { frame } = useSpinner(isRunning);
    const spinner = isRunning ? `${frame} ` : "";

    return (
        <Panel dense border={true} flexDirection="column" gap={0} height={showShortcuts ? 4 : 2}>
            <Container flexDirection="row" justifyContent="space-between" padding={{ left: 1, right: 1 }}>
                <Label color="success" bold>
                    {spinner}{status}
                </Label>
            </Container>

            {showShortcuts ? (
                <Container padding={{ left: 1, right: 1 }}>
                    <Label color="mutedText">{shortcuts}</Label>
                </Container>
            ) : null}
        </Panel>
    );
}
