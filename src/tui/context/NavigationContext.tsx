import {
    createContext,
    useContext,
    useMemo,
    useReducer,
    useRef,
    useCallback,
    type ReactNode,
} from "react";

export interface ScreenEntry<TParams = unknown> {
    route: string;
    params?: TParams;
    meta?: { focus?: string; breadcrumb?: string[] };
}

export interface ModalEntry<TParams = unknown> {
    id: string;
    params?: TParams;
}

/**
 * Back handler function.
 * Return true if handled, false to let navigation handle it.
 */
export type BackHandler = () => boolean;

export interface NavigationAPI {
    current: ScreenEntry;
    stack: ScreenEntry[];
    push: <TParams>(route: string, params?: TParams, meta?: ScreenEntry["meta"]) => void;
    replace: <TParams>(route: string, params?: TParams, meta?: ScreenEntry["meta"]) => void;
    reset: <TParams>(route: string, params?: TParams, meta?: ScreenEntry["meta"]) => void;
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

type NavigationProviderProps<TParams = unknown> = {
    initialScreen: ScreenEntry<TParams>;
    children: ReactNode;
    /** Called when we can't go back anymore (at root with empty stack) */
    onExit?: () => void;
};

type NavigationAction =
    | { type: "push"; screen: ScreenEntry }
    | { type: "replace"; screen: ScreenEntry }
    | { type: "reset"; screen: ScreenEntry }
    | { type: "pop" }
    | { type: "openModal"; modal: ModalEntry }
    | { type: "closeModal" };

type NavigationState = {
    stack: ScreenEntry[];
    modalStack: ModalEntry[];
};

function navigationReducer(
    state: NavigationState,
    action: NavigationAction
): NavigationState {
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

const NavigationContext = createContext<NavigationAPI | null>(null);

export function NavigationProvider<TParams = unknown>({
    initialScreen,
    children,
    onExit,
}: NavigationProviderProps<TParams>) {
    const [state, dispatch] = useReducer(navigationReducer, {
        stack: [initialScreen],
        modalStack: [],
    });

    // Back handler ref - set by the current screen
    const backHandlerRef = useRef<BackHandler | null>(null);

    const setBackHandler = useCallback((handler: BackHandler | null) => {
        backHandlerRef.current = handler;
    }, []);

    const api = useMemo<NavigationAPI>(() => {
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
            push: <TParams,>(route: string, params?: TParams, meta?: ScreenEntry["meta"]) =>
                dispatch({ type: "push", screen: { route, params, meta } }),
            replace: <TParams,>(route: string, params?: TParams, meta?: ScreenEntry["meta"]) =>
                dispatch({ type: "replace", screen: { route, params, meta } }),
            reset: <TParams,>(route: string, params?: TParams, meta?: ScreenEntry["meta"]) =>
                dispatch({ type: "reset", screen: { route, params, meta } }),
            pop: () => dispatch({ type: "pop" }),
            canGoBack: stack.length > 1 || modalStack.length > 0,
            modalStack,
            currentModal,
            openModal: <TParams,>(id: string, params?: TParams) =>
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

export function useNavigation(): NavigationAPI {
    const context = useContext(NavigationContext);
    if (!context) {
        throw new Error("useNavigation must be used within a NavigationProvider");
    }
    return context;
}
