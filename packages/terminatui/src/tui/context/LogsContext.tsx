import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { AppContext } from "../../core/context.ts";
import type { LogEvent } from "../../core/logger.ts";

interface LogsContextValue {
    logs: LogEvent[];
}

const LogsContext = createContext<LogsContextValue | null>(null);

export function LogsProvider({ children }: { children: ReactNode }) {
    const [logs, setLogs] = useState<LogEvent[]>([]);

    useEffect(() => {
        const unsubscribe = AppContext.current.logger.onLogEvent((event: LogEvent) => {
            setLogs((prev) => [...prev, event]);
        });

        return () => {
            unsubscribe?.();
        };
    }, []);

    const value = useMemo(() => ({ logs }), [logs]);

    return <LogsContext.Provider value={value}>{children}</LogsContext.Provider>;
}

export function useLogs(): LogsContextValue {
    const context = useContext(LogsContext);
    if (!context) {
        throw new Error("useLogs must be used within LogsProvider");
    }
    return context;
}
