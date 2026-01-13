import type { ReactNode } from "react";

/**
 * Screen component type.
 * Screens receive no props - they get everything from context.
 */
export type ScreenComponent = () => ReactNode;

/**
 * Modal component type.
 * Modals receive their params and a close function.
 */
export type ModalComponent<TParams = unknown> = (props: {
    params: TParams;
    onClose: () => void;
}) => ReactNode;

/**
 * Screen registry - maps route names to screen components.
 */
const screenRegistry = new Map<string, ScreenComponent>();

/**
 * Modal registry - maps modal IDs to modal components.
 */
const modalRegistry = new Map<string, ModalComponent<unknown>>();

/**
 * Register a screen component for a route.
 * Typically called at module load time.
 */
export function registerScreen(route: string, component: ScreenComponent): void {
    screenRegistry.set(route, component);
}

/**
 * Register a modal component for a modal ID.
 * Typically called at module load time.
 */
export function registerModal<TParams = unknown>(
    id: string,
    component: ModalComponent<TParams>
): void {
    modalRegistry.set(id, component as ModalComponent<unknown>);
}

/**
 * Get a screen component by route.
 * Returns undefined if not registered.
 */
export function getScreen(route: string): ScreenComponent | undefined {
    return screenRegistry.get(route);
}

/**
 * Get a modal component by ID.
 * Returns undefined if not registered.
 */
export function getModal(id: string): ModalComponent<unknown> | undefined {
    return modalRegistry.get(id);
}

/**
 * Get all registered screen routes.
 */
export function getRegisteredScreens(): string[] {
    return Array.from(screenRegistry.keys());
}

/**
 * Get all registered modal IDs.
 */
export function getRegisteredModals(): string[] {
    return Array.from(modalRegistry.keys());
}
