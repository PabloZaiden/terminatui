import { Theme } from "../theme.ts";
import { LogColors } from "./logColors.ts";
import type { LogEvent } from "../../core/logger.ts";
import { useKeyboardHandler } from "../hooks/useKeyboardHandler.ts";
import { KeyboardPriority } from "../context/KeyboardContext.tsx";
import { AppContext } from "../../core/context.ts";

interface LogsModalProps {
    /** Log entries to display */
    logs: LogEvent[];
    /** Whether the panel is visible */
    visible: boolean;
    /** Callback when the modal is closed */
    onClose: () => void;
    /** Callback when the logs are copied */
    onCopy?: (content: string, label: string) => void;
}

/**
 * Panel displaying log entries with color-coded levels.
 */
export function LogsModal({
    logs,
    visible,
    onClose,
    onCopy
}: LogsModalProps) {
    // Modal keyboard handler
    useKeyboardHandler(
        (event) => {
            const { key } = event;
            if (key.name === "escape" || key.name === "return" || key.name === "enter" || key.name === "l") {
                onClose();
                AppContext.current.logger.trace(`Logs closed via keyboard shortcut.`);
                event.stopPropagation();
                return;
            }

            // Y to copy
            if (key.name === "y") {
                onCopy?.(logs.map(log => log.message).join("\n"), "Logs");
                event.stopPropagation();
                return;
            }
        },
        KeyboardPriority.Modal,
        { enabled: visible, modal: true }
    );

    if (!visible) {
        return null;
    }

    const title = `Logs - ${logs.length}`;

    return (
        <box
            title={title}
            position="absolute"
            top={3}
            bottom={3}
            left={4}
            right={4}
            backgroundColor={Theme.overlay}
            border={true}
            borderStyle="rounded"
            borderColor={Theme.overlayTitle}
            padding={1}
            flexDirection="column"
            zIndex={20}
        >
            <scrollbox
                scrollY={true}
                flexGrow={1}
                stickyScroll={true}
                stickyStart="bottom"
                focused={true}
            >
                <box flexDirection="column" gap={0}>
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
                </box>
            </scrollbox>
        </box>
    );
}
