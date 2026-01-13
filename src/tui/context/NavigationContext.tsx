import {
    createContext,
    useContext,
    useMemo,
    useReducer,
    useRef,
    useCallback,
    type ReactNode,
} from "react";

// Generic route→params maps provided by the app
export type RoutesMap = Record<string, object | undefined>;

type RouteKey<M extends RoutesMap> = Extract<keyof M, string>;

export type ScreenEntry<M extends RoutesMap, R extends RouteKey<M> = RouteKey<M>> = {
    route: R;
    params?: M[R];
    meta?: { focus?: string; breadcrumb?: string[] };
};

export interface ModalEntry<TParams = unknown> {
    id: string;
    params?: TParams;
}

/**
 * Back handler function.
 * Return true if handled, false to let navigation handle it.
 */
export type BackHandler = () => boolean;

export interface NavigationAPI<Routes extends RoutesMap = RoutesMap> {
    current: ScreenEntry<Routes>;
    stack: ScreenEntry<Routes>[];
    push: <R extends RouteKey<Routes>>(screen: ScreenEntry<Routes, R>) => void;
    replace: <R extends RouteKey<Routes>>(screen: ScreenEntry<Routes, R>) => void;
    reset: <R extends RouteKey<Routes>>(screen: ScreenEntry<Routes, R>) => void;
    pop: () => void;
    canGoBack: boolean;

    modalStack: ModalEntry[];
    currentModal?: ModalEntry;
    openModal: <TParams>(id: string, params?: TParams) => void;
    closeModal: () => void;
    hasModal: boolean;

    /**
     * Handle back/escape.
     * 1. If modal is open, closes modal
     * 2. Otherwise, calls the registered back handler (if any)
     * 3. If no handler or handler returns false, pops the stack
     */
    goBack: () => void;

    /**
     * Register a back handler for the current screen.
     * The handler is called when goBack() is invoked (after closing modals).
     * Return true from the handler if it handled the back action.
     */
    setBackHandler: (handler: BackHandler | null) => void;
}

type NavigationProviderProps<Routes extends RoutesMap> = {
    initialScreen: ScreenEntry<Routes>;
    children: ReactNode;
    /** Called when we can't go back anymore (at root with empty stack) */
    onExit?: () => void;
    // Phantom field to keep generic parameter in use for inference
    _routesType?: Routes;
};

type NavigationAction<Routes extends RoutesMap> =
    | { type: "push"; screen: ScreenEntry<Routes> }
    | { type: "replace"; screen: ScreenEntry<Routes> }
    | { type: "reset"; screen: ScreenEntry<Routes> }
    | { type: "pop" }
    | { type: "openModal"; modal: ModalEntry }
    | { type: "closeModal" };

type NavigationState<Routes extends RoutesMap> = {
    stack: ScreenEntry<Routes>[];
    modalStack: ModalEntry[];
};

function navigationReducer<Routes extends RoutesMap>(
    state: NavigationState<Routes>,
    action: NavigationAction<Routes>
): NavigationState<Routes> {
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

const NavigationContext = createContext<NavigationAPI<any> | null>(null);

export function NavigationProvider<Routes extends RoutesMap>({
    initialScreen,
    children,
    onExit,
}: NavigationProviderProps<Routes>) {
    const [state, dispatch] = useReducer(navigationReducer<Routes>, {
        stack: [initialScreen],
        modalStack: [],
    });

    // Back handler ref - set by the current screen
    const backHandlerRef = useRef<BackHandler | null>(null);

    const setBackHandler = useCallback((handler: BackHandler | null) => {
        backHandlerRef.current = handler;
    }, []);

    const api = useMemo<NavigationAPI<Routes>>(() => {
        const stack = state.stack;
        const modalStack = state.modalStack;
        const current = stack[stack.length - 1]!;
        const currentModal = modalStack[modalStack.length - 1];

        const goBack = () => {
            // 1. If modal is open, close it
            if (modalStack.length > 0) {
                dispatch({ type: "closeModal" });
                return;
            }

            // 2. Let the screen's back handler try first
            if (backHandlerRef.current) {
                const handled = backHandlerRef.current();
                if (handled) {
                    return;
                }
            }

            // 3. Pop the stack if possible
            if (stack.length > 1) {
                dispatch({ type: "pop" });
                return;
            }

            // 4. At root, call onExit
            onExit?.();
        };

        return {
            current,
            stack,
            push: (screen) => dispatch({ type: "push", screen }),
            replace: (screen) => dispatch({ type: "replace", screen }),
            reset: (screen) => dispatch({ type: "reset", screen }),
            pop: () => dispatch({ type: "pop" }),
            canGoBack: stack.length > 1 || modalStack.length > 0,
            modalStack,
            currentModal,
            openModal: <TParams = unknown>(id: string, params?: TParams) => 
                dispatch({ type: "openModal", modal: { id, params } }),
            closeModal: () => dispatch({ type: "closeModal" }),
            hasModal: modalStack.length > 0,
            goBack,
            setBackHandler,
        };
    }, [state, onExit, setBackHandler]);

    return (
        <NavigationContext.Provider value={api}>
            {children}
        </NavigationContext.Provider>
    );
}

export function useNavigation<Routes extends RoutesMap = RoutesMap>(): NavigationAPI<Routes> {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error("useNavigation must be used within a NavigationProvider");
    }
    return context as NavigationAPI<Routes>;
}
