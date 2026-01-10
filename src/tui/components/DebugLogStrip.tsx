import { useMemo } from "react";
import { Theme } from "../theme.ts";
import { useLogStream, type LogSource } from "../hooks/index.ts";
import { LogColors } from "./logColors.ts";

interface DebugLogStripProps {
    logSource?: LogSource;
    height?: number;
}

const DEFAULT_HEIGHT = 8;

function formatTime(date: Date): string {
    const pad = (value: number) => value.toString().padStart(2, "0");
    return `${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
}

/**
 * Compact debugging strip that shows the latest log lines when debug mode is enabled.
 */
export function DebugLogStrip({ logSource, height = DEFAULT_HEIGHT }: DebugLogStripProps) {
    const { logs } = useLogStream(logSource);
    const visibleLogs = useMemo(() => logs.slice(-height), [logs, height]);

    return (
        <box
            flexDirection="column"
            border={true}
            borderStyle="rounded"
            borderColor={Theme.warning}
            title="Debug Logs"
            padding={1}
            height={height}>
            <scrollbox
                scrollY={true}
                height={height - 4} // 2 per border, 2 per padding
                stickyScroll={true}
                stickyStart="bottom"
                focused={false}
            >
                <box
                    flexDirection="column"
                    gap={0}
                >
                    {visibleLogs.length === 0 ? (
                        <text fg={Theme.label}>Debugging enabled - waiting for logs...</text>
                    ) : (
                        visibleLogs.map((log, idx) => (
                            <text key={`${log.timestamp.getTime()}-${idx}`} fg={LogColors[log.level] ?? Theme.statusText}>
                                [{formatTime(log.timestamp)}] {Bun.stripANSI(log.message).trimEnd()}
                            </text>
                        ))
                    )}
                </box>
            </scrollbox>
        </box>
    );
}
