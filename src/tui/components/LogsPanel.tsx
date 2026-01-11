import { Theme } from "../theme.ts";
import { LogColors } from "./logColors.ts";
import { AppContext } from "../../core/context.ts";
import type { LogEvent } from "../../core/logger.ts";

interface LogsPanelProps {
    /** Log entries to display */
    logs: LogEvent[];
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

    AppContext.current.logger

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
                        log
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
