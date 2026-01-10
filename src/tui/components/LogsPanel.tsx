import { Theme } from "../theme.ts";
import type { LogEntry } from "../hooks/useLogStream.ts";
import { LogColors } from "./logColors.ts";

interface LogsPanelProps {
    /** Log entries to display */
    logs: LogEntry[];
    /** Whether the panel is visible */
    visible: boolean;
    /** Whether the panel is focused */
    focused: boolean;
    /** Whether to expand to fill available space */
    expanded?: boolean;
}

/**
 * Panel displaying log entries with color-coded levels.
 */
export function LogsPanel({
    logs,
    visible,
    focused,
    expanded = false,
}: LogsPanelProps) {
    if (!visible) {
        return null;
    }

    const borderColor = focused ? Theme.borderFocused : Theme.border;
    const title = `Logs - ${logs.length}`;

    // When expanded, grow to fill. Otherwise fixed height.
    const boxProps = expanded
        ? { flexGrow: 1 }
        : { height: 10, flexShrink: 0 };

    return (
        <box
            flexDirection="column"
            border={true}
            borderStyle="rounded"
            borderColor={borderColor}
            title={title}
            padding={1}
            {...boxProps}
        >
            <scrollbox
                scrollY={true}
                flexGrow={1}
                stickyScroll={true}
                stickyStart="bottom"
                focused={focused}
            >
                <box flexDirection="column" gap={0}>
                    {logs.map((log, idx) => {
                        const color = LogColors[log.level] ?? Theme.statusText;
                        // Strip ANSI codes but preserve line breaks
                        const sanitized = typeof Bun !== "undefined"
                            ? Bun.stripANSI(log.message).trim()
                            : log.message.replace(/\x1B\[[0-9;]*[a-zA-Z]/g, "").trim();

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
