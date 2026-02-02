import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { AnyCommand } from "../../../core/command.ts";

import { useNavigation } from "../../context/NavigationContext.tsx";
import { useExecutor } from "../../context/ExecutorContext.tsx";
import { useLogs } from "../../context/LogsContext.tsx";

import { TuiDriver } from "../TuiDriver.tsx";

const TuiDriverContext = createContext<TuiDriver | null>(null);

export function TuiDriverProvider({
    appName,
    commands,
    children,
}: {
    appName: string;
    commands: AnyCommand[];
    children: ReactNode;
}) {
    const navigation = useNavigation();
    const executor = useExecutor();
    const { logs } = useLogs();

    const driver = useMemo(() => {
        return new TuiDriver({
            appName,
            commands,
            navigation,
            executor,
            logs,
        });
    }, [appName, commands, executor, logs, navigation]);

    return <TuiDriverContext.Provider value={driver}>{children}</TuiDriverContext.Provider>;
}

export function useTuiDriver(): TuiDriver {
    const driver = useContext(TuiDriverContext);
    if (!driver) {
        throw new Error("useTuiDriver must be used within TuiDriverProvider");
    }
    return driver;
}
