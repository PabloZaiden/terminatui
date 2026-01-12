import { Theme } from "../theme.ts";
import { LogColors } from "./logColors.ts";
import type { LogEvent } from "../../core/logger.ts";
import { ModalBase } from "./ModalBase.tsx";

interface LogsModalProps {
    /** Log entries to display */
    logs: LogEvent[];
    /** Whether the panel is visible */
    visible: boolean;
    /** Callback when the modal is closed */
    onClose?: () => void;
}

/**
 * Panel displaying log entries with color-coded levels.
 */
export function LogsModal({
    logs,
    visible,
    onClose: _onClose,
}: LogsModalProps) {
    if (!visible) {
        return null;
    }

    const title = `Logs - ${logs.length}`;

    return (
        <ModalBase title={title} top={4} bottom={4} left={4} right={4}>
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
        </ModalBase>
    );
}
