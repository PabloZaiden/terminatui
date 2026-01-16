import { createContext, useContext, useEffect, useMemo, type ReactNode } from "react";
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
    onDispatchAction,
}: {
    children: ReactNode;
    navigation: NavigationAPI;
    onDispatchAction?: (dispatchAction: TuiActionDispatcher) => () => void;
}) {
    const dispatchAction = useMemo<TuiActionDispatcher>(() => {
        return (action) => {
            if (action.type === "nav.back") {
                navigation.goBack();
                return;
            }


            if (action.type === "logs.open") {
                navigation.openModal("logs");
            }
        };
    }, [navigation]);

    // Allow adapter-level key bindings to call dispatchAction.
    useEffect(() => {
        return onDispatchAction?.(dispatchAction);
    }, [dispatchAction, onDispatchAction]);

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
