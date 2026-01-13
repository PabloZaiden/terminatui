import { useKeyboard } from "@opentui/react";
import type { KeyEvent } from "@opentui/core";
import { useCallback, useMemo, useRef } from "react";
import type { KeyboardAdapter, KeyboardEvent, KeyHandler } from "../types.ts";

function normalizeKeyEvent(key: KeyEvent): KeyboardEvent {
    return {
        name: key.name,
        sequence: key.sequence,
        ctrl: key.ctrl,
        shift: key.shift,
        meta: key.meta,
    };
}

export function useOpenTuiKeyboardAdapter(): KeyboardAdapter {
    const handlerStackRef = useRef<{ id: string; handler: KeyHandler }[]>([]);
    const globalHandlerRef = useRef<KeyHandler | null>(null);

    const setActiveHandler = useCallback((id: string, handler: KeyHandler) => {
        handlerStackRef.current = handlerStackRef.current.filter((h) => h.id !== id);
        handlerStackRef.current.push({ id, handler });

        return () => {
            handlerStackRef.current = handlerStackRef.current.filter((h) => h.id !== id);
        };
    }, []);

    const setGlobalHandler = useCallback((handler: KeyHandler) => {
        globalHandlerRef.current = handler;
    }, []);

    useKeyboard((key: KeyEvent) => {
        const event = normalizeKeyEvent(key);

        if (globalHandlerRef.current) {
            const handled = globalHandlerRef.current(event);
            if (handled) {
                return;
            }
        }

        const activeHandler = handlerStackRef.current[handlerStackRef.current.length - 1];
        if (activeHandler) {
            activeHandler.handler(event);
        }
    });

    return useMemo(
        () => ({
            setActiveHandler,
            setGlobalHandler,
        }),
        [setActiveHandler, setGlobalHandler]
    );
}
