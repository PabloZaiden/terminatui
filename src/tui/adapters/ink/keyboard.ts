import { useInput, type Key } from "ink";
import { useCallback, useMemo, useRef } from "react";
import type { KeyboardAdapter, KeyboardEvent, KeyHandler } from "../types.ts";

function normalizeKeyName(input: string, key: Key): KeyboardEvent {
    const event: KeyboardEvent = {
        name: input,
        sequence: input,
        ctrl: Boolean(key.ctrl),
        shift: Boolean(key.shift),
        meta: Boolean(key.meta),
    };

    if (key.return) {
        event.name = "return";
    } else if (key.escape) {
        event.name = "escape";
    } else if (key.backspace) {
        event.name = "backspace";
    } else if (key.delete) {
        // Terminals often send escape sequences for “Delete” that some libraries
        // expose as `delete`, others as `del`. Keep it normalized.
        event.name = "delete";
    } else if (key.tab) {
        event.name = "tab";
    } else if (key.upArrow) {
        event.name = "up";
    } else if (key.downArrow) {
        event.name = "down";
    } else if (key.leftArrow) {
        event.name = "left";
    } else if (key.rightArrow) {
        event.name = "right";
    } else if (key.pageUp) {
        event.name = "pageup";
    } else if (key.pageDown) {
        event.name = "pagedown";
    } else if (key.home) {
        event.name = "home";
    } else if (key.end) {
        event.name = "end";
    }

    // Normalize enter -> return (some code checks either)
    if (event.name === "enter") {
        event.name = "return";
    }

    return event;
}

export function useInkKeyboardAdapter(): KeyboardAdapter {
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
        const previous = globalHandlerRef.current;
        globalHandlerRef.current = handler;

        return () => {
            globalHandlerRef.current = previous;
        };
    }, []);

    useInput((input, key) => {
        const event = normalizeKeyName(input, key);

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
