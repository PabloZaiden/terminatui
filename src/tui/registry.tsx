import type { ReactNode } from "react";
import { CliModal } from "./components/CliModal.tsx";
import { EditorModal } from "./components/EditorModal.tsx";
import { LogsModal } from "./components/LogsModal.tsx";
import type { ScreenBase } from "./screens/ScreenBase";
import { CommandSelectScreen } from "./screens/CommandSelectScreen";
import { ConfigScreen } from "./screens/ConfigScreen";
import { ErrorScreen } from "./screens/ErrorScreen";
import { ResultsScreen } from "./screens/ResultsScreen";
import { RunningScreen } from "./screens/RunningScreen";

/**
 * Screen component type.
 * Screens receive no props - they get everything from context.
 */
export type ScreenComponent = () => ReactNode;

/**
 * Modal component type.
 * Modals receive their params and a close function.
 */
export type ModalComponent<TParams> = (props: {
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
const modalRegistry = new Map<string, ModalComponent<any>>();

/**
 * Register a screen component for a route.
 * Typically called at module load time.
 */

export function registerScreen(screen: ScreenBase): void {
    screenRegistry.set(screen.getRoute(), screen.component());
}

/**
 * Register a modal component for a modal ID.
 * Typically called at module load time.
 */
export interface ModalDefinition<TParams> {
    getId(): string;
    component(): ModalComponent<TParams>;
}

export function registerModal<TParams>(modal: ModalDefinition<TParams>): void {
    modalRegistry.set(modal.getId(), modal.component());
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
export function getModal<TParams>(id: string): ModalComponent<TParams> | undefined {
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

export function registerAllScreens(): void {
    registerScreen(new CommandSelectScreen());
    registerScreen(new ConfigScreen());
    registerScreen(new RunningScreen());
    registerScreen(new ResultsScreen());
    registerScreen(new ErrorScreen());
}

export function registerAllModals(): void {
    registerModal(new EditorModal());
    registerModal(new CliModal());
    registerModal(new LogsModal());
}
