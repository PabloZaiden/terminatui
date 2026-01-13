import { describe, expect, test } from "bun:test";
import type {
    NavigationAPI,
    ScreenEntry,
    ModalEntry,
    RoutesMap,
    ModalsMap,
} from "../tui/context/NavigationContext.tsx";

type Routes = {
    CommandSelect: { commandPath?: string[] };
    Config: { commandName: string; commandPath: string[] };
};

type Modals = {
    "cli-arguments": { command: string };
    "property-editor": { fieldKey: string };
};

describe("NavigationContext types", () => {
    test("NavigationAPI shape compiles for routes and modals", () => {
        const mock: NavigationAPI<Routes, Modals> = {
            current: { route: "CommandSelect", params: { commandPath: [] } },
            stack: [{ route: "CommandSelect", params: { commandPath: [] } }],
            push: () => {},
            pop: () => {},
            replace: () => {},
            reset: () => {},
            canGoBack: false,
            goBack: () => {},
            setBackHandler: () => () => {},
            modalStack: [],
            currentModal: undefined,
            openModal: () => {},
            closeModal: () => {},
            hasModal: false,
        };

        expect(mock.current.route).toBe("CommandSelect");
        expect(mock.stack.length).toBe(1);
        expect(mock.canGoBack).toBe(false);
    });

    test("ScreenEntry and ModalEntry enforce key safety", () => {
        const screen: ScreenEntry<Routes> = { route: "Config", params: { commandName: "foo", commandPath: ["foo"] } };
        const modal: ModalEntry<Modals> = { id: "cli-arguments", params: { command: "foo" } };

        expect(screen.route).toBe("Config");
        expect(modal.id).toBe("cli-arguments");
    });

    test("default generics allow arbitrary maps", () => {
        const genericScreen: ScreenEntry<RoutesMap> = { route: "any", params: { value: 1 } };
        const genericModal: ModalEntry<ModalsMap> = { id: "modal", params: { anything: true } };

        expect(genericScreen.route).toBe("any");
        expect(genericModal.id).toBe("modal");
    });
});
