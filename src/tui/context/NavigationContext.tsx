import {
    createContext,
    useContext,
    useMemo,
    useReducer,
    type ReactNode,
} from "react";

// Generic route→params maps provided by the app
export type RoutesMap = Record<string, object | undefined>;
export type ModalsMap = Record<string, object | undefined>;

type RouteKey<M extends RoutesMap> = Extract<keyof M, string>;
type ModalKey<M extends ModalsMap> = Extract<keyof M, string>;

export type ScreenEntry<M extends RoutesMap, R extends RouteKey<M> = RouteKey<M>> = {
    route: R;
    params?: M[R];
    meta?: { focus?: string; breadcrumb?: string[] };
};

export type ModalEntry<M extends ModalsMap, ID extends ModalKey<M> = ModalKey<M>> = {
    id: ID;
    params?: M[ID];
};

export interface NavigationAPI<Routes extends RoutesMap = RoutesMap, Modals extends ModalsMap = ModalsMap> {
    current: ScreenEntry<Routes>;
    stack: ScreenEntry<Routes>[];
    push: <R extends RouteKey<Routes>>(screen: ScreenEntry<Routes, R>) => void;
    replace: <R extends RouteKey<Routes>>(screen: ScreenEntry<Routes, R>) => void;
    reset: <R extends RouteKey<Routes>>(screen: ScreenEntry<Routes, R>) => void;
    pop: () => void;
    canGoBack: boolean;

    modalStack: ModalEntry<Modals>[];
    currentModal?: ModalEntry<Modals>;
    openModal: <ID extends ModalKey<Modals>>(modal: ModalEntry<Modals, ID>) => void;
    closeModal: () => void;
    hasModal: boolean;
}

type NavigationProviderProps<Routes extends RoutesMap, Modals extends ModalsMap> = {
    initialScreen: ScreenEntry<Routes>;
    children: ReactNode;
    // Phantom fields to keep generic parameters in use for inference
    _routesType?: Routes;
    _modalsType?: Modals;
};

type NavigationAction<Routes extends RoutesMap, Modals extends ModalsMap> =
    | { type: "push"; screen: ScreenEntry<Routes> }
    | { type: "replace"; screen: ScreenEntry<Routes> }
    | { type: "reset"; screen: ScreenEntry<Routes> }
    | { type: "pop" }
    | { type: "openModal"; modal: ModalEntry<Modals> }
    | { type: "closeModal" };

type NavigationState<Routes extends RoutesMap, Modals extends ModalsMap> = {
    stack: ScreenEntry<Routes>[];
    modalStack: ModalEntry<Modals>[];
};

function navigationReducer<Routes extends RoutesMap, Modals extends ModalsMap>(
    state: NavigationState<Routes, Modals>,
    action: NavigationAction<Routes, Modals>
): NavigationState<Routes, Modals> {
    switch (action.type) {
        case "push":
            return { ...state, stack: [...state.stack, action.screen] };
        case "replace": {
            const nextStack = state.stack.length === 0
                ? [action.screen]
                : [...state.stack.slice(0, -1), action.screen];
            return { ...state, stack: nextStack };
        }
        case "reset":
            return { ...state, stack: [action.screen] };
        case "pop": {
            if (state.stack.length <= 1) return state;
            return { ...state, stack: state.stack.slice(0, -1) };
        }
        case "openModal":
            return { ...state, modalStack: [...state.modalStack, action.modal] };
        case "closeModal": {
            if (state.modalStack.length === 0) return state;
            return { ...state, modalStack: state.modalStack.slice(0, -1) };
        }
        default:
            return state;
    }
}

const NavigationContext = createContext<NavigationAPI<any, any> | null>(null);

export function NavigationProvider<Routes extends RoutesMap, Modals extends ModalsMap>({
    initialScreen,
    children,
}: NavigationProviderProps<Routes, Modals>) {
    const [state, dispatch] = useReducer(navigationReducer<Routes, Modals>, {
        stack: [initialScreen],
        modalStack: [],
    });

    const api = useMemo<NavigationAPI<Routes, Modals>>(() => {
        const stack = state.stack;
        const modalStack = state.modalStack;
        const current = stack[stack.length - 1]!;
        const currentModal = modalStack[modalStack.length - 1];

        return {
            current,
            stack,
            push: (screen) => dispatch({ type: "push", screen }),
            replace: (screen) => dispatch({ type: "replace", screen }),
            reset: (screen) => dispatch({ type: "reset", screen }),
            pop: () => {
                if (modalStack.length > 0) {
                    dispatch({ type: "closeModal" });
                } else {
                    dispatch({ type: "pop" });
                }
            },
            canGoBack: stack.length > 1 || modalStack.length > 0,
            modalStack,
            currentModal,
            openModal: (modal) => dispatch({ type: "openModal", modal }),
            closeModal: () => dispatch({ type: "closeModal" }),
            hasModal: modalStack.length > 0,
        };
    }, [state]);

    return (
        <NavigationContext.Provider value={api}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation<Routes extends RoutesMap = RoutesMap, Modals extends ModalsMap = ModalsMap>(): NavigationAPI<Routes, Modals> {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error("useNavigation must be used within a NavigationProvider");
    }
    return context as NavigationAPI<Routes, Modals>;
}
