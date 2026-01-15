import { useCallback } from "react";
import { Container } from "../semantic/Container.tsx";
import { ScrollView } from "../semantic/ScrollView.tsx";
import { useActiveKeyHandler } from "../hooks/useActiveKeyHandler.ts";
import { useClipboardProvider } from "../hooks/useClipboardProvider.ts";
import { Label } from "../semantic/Label.tsx";
import { LogColors } from "../components/logColors.ts";
import { ModalBase } from "../components/ModalBase.tsx";
import { useLogs } from "../context/LogsContext.tsx";
import type { ModalComponent, ModalDefinition } from "../registry.ts";
import { LogLevel } from "../../core/logger.ts";

export interface LogsModalParams {}

export class LogsModal implements ModalDefinition<LogsModalParams> {
    static readonly Id = "logs";

    getId(): string {
        return LogsModal.Id;
    }

    component(): ModalComponent<LogsModalParams> {
        return function LogsModalComponentWrapper({ params: _params, onClose }: { params: LogsModalParams; onClose: () => void; }) {
            return (
                <LogsModalView
                    visible={true}
                    onClose={onClose}
                />
            );
        };
    }
}

interface LogsModalViewProps {
    /** Whether the panel is visible */
    visible: boolean;
    /** Callback when the modal is closed */
    onClose: () => void;
}

/**
 * Panel displaying log entries with color-coded levels.
 */
function LogsModalView({
    visible,
    onClose,
}: LogsModalViewProps) {
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
                        const color = LogColors[log.level] ?? LogColors[LogLevel.info];
                        const sanitized = Bun.stripANSI(log.message).trim();

                        return (
                            <Label key={`${log.timestamp.getTime()}-${idx}`}>
                                <span fg={color}>{sanitized}</span>
                            </Label>
                        );
                    })}

                    {logs.length === 0 && (
                        <Label color="mutedText">No logs yet...</Label>
                    )}
                </Container>
            </ScrollView>
        </ModalBase>
    );
}
