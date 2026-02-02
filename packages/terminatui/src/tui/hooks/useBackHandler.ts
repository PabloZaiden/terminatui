import { useEffect } from "react";
import { useNavigation, type BackHandler } from "../context/NavigationContext.tsx";

/**
 * Register a back handler for the current screen.
 * 
 * When the user presses Esc (or calls navigation.goBack()), this handler
 * is called. Return true if you handled the back action, false to let
 * navigation proceed with default behavior (pop stack or exit).
 * 
 * The handler is automatically unregistered when the component unmounts.
 * 
 * @example
 * ```tsx
 * // In a screen with special back behavior
 * useBackHandler(() => {
 *     if (hasUnsavedChanges) {
 *         showConfirmDialog();
 *         return true; // We handled it
 *     }
 *     return false; // Let navigation pop
 * });
 * ```
 */
export function useBackHandler(handler: BackHandler): void {
    const navigation = useNavigation();

    useEffect(() => {
        navigation.setBackHandler(handler);
        return () => {
            navigation.setBackHandler(null);
        };
    }, [navigation, handler]);
}
