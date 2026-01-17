import { createContext, useContext, useMemo, type ReactNode } from "react";
import type { NavigationAPI } from "./NavigationContext.tsx";
import type { TuiAction } from "../actions.ts";

export type TuiActionDispatcher = (action: TuiAction) => void;

interface ActionContextValue {
    dispatchAction: TuiActionDispatcher;
}

const ActionContext = createContext<ActionContextValue | null>(null);

export function ActionProvider({
    children,
    navigation,
}: {
    children: ReactNode;
    navigation: NavigationAPI;
}) {
    const dispatchAction = useMemo<TuiActionDispatcher>(() => {
        return (action) => {
            if (action.type === "nav.back") {
                navigation.goBack();
                return;
            }


            if (action.type === "logs.open") {
                // Prevent stacking: only open if logs modal is not already open
                const isLogsAlreadyOpen = navigation.modalStack.some((m) => m.id === "logs");
                if (!isLogsAlreadyOpen) {
                    navigation.openModal("logs");
                }
            }
        };
    }, [navigation]);

    return (
        <ActionContext.Provider value={{ dispatchAction }}>
            {children}
        </ActionContext.Provider>
    );
}

export function useAction(): ActionContextValue {
    const context = useContext(ActionContext);
    if (!context) {
        throw new Error("useAction must be used within an ActionProvider");
    }
    return context;
}
