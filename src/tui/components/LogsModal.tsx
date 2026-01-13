import { useCallback } from "react";
import { Container } from "../semantic/Container.tsx";
import { ScrollView } from "../semantic/ScrollView.tsx";
import { Theme } from "../theme.ts";
import { useActiveKeyHandler } from "../hooks/useActiveKeyHandler.ts";
import { useClipboardProvider } from "../hooks/useClipboardProvider.ts";
import { LogColors } from "./logColors.ts";
import { ModalBase } from "./ModalBase.tsx";
import { useLogs } from "../context/LogsContext.tsx";

interface LogsModalProps {
    /** Whether the panel is visible */
    visible: boolean;
    /** Callback when the modal is closed */
    onClose: () => void;
}

/**
 * Panel displaying log entries with color-coded levels.
 */
export function LogsModal({
    visible,
    onClose,
}: LogsModalProps) {
    const { logs } = useLogs();
    // Handle Enter to close (Esc and Ctrl+L are handled globally)
    useActiveKeyHandler(
        (event) => {
            if (event.name === "return" || event.name === "enter") {
                onClose();
                return true;
            }
            return false;
        },
        { enabled: visible }
    );

    // Register clipboard provider - logs content takes precedence when modal is open
    useClipboardProvider(
        useCallback(() => ({
            content: logs.map((l) => l.message).join("\n"),
            label: "Logs",
        }), [logs]),
        visible
    );

    if (!visible) {
        return null;
    }

    const title = `Logs - ${logs.length}`;

    return (
        <ModalBase title={title} top={4} bottom={4} left={4} right={4}>
            <ScrollView axis="vertical" flex={1} stickyToEnd={true} focused={true}>
                <Container flexDirection="column" gap={0}>
                    {logs.map((log, idx) => {
                        const color = LogColors[log.level] ?? Theme.statusText;
                        const sanitized = Bun.stripANSI(log.message).trim();

                        return (
                            <text key={`${log.timestamp.getTime()}-${idx}`} fg={color}>
                                {sanitized}
                            </text>
                        );
                    })}

                    {logs.length === 0 && (
                        <text fg={Theme.label}>No logs yet...</text>
                    )}
                </Container>
            </ScrollView>
        </ModalBase>
    );
}
