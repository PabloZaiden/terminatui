import { describe, expect, test } from "bun:test";
import type {
    NavigationAPI,
    ScreenEntry,
    ModalEntry,
} from "../tui/context/NavigationContext.tsx";

type ConfigParams = { commandName: string; commandPath: string[] };
type CliArgumentsModalParams = { command: string };

describe("NavigationContext types", () => {
    test("NavigationAPI shape compiles for routes and modals", () => {
        const mock: NavigationAPI = {
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

    test("ScreenEntry and ModalEntry use specific param types", () => {
        const screen: ScreenEntry<ConfigParams> = { route: "Config", params: { commandName: "foo", commandPath: ["foo"] } };
        const modal: ModalEntry<CliArgumentsModalParams> = { id: "cli-arguments", params: { command: "foo" } };

        expect(screen.route).toBe("Config");
        expect(modal.id).toBe("cli-arguments");
    });

    test("default generics allow arbitrary params", () => {
        const genericScreen: ScreenEntry = { route: "any", params: { value: 1 } };
        const genericModal: ModalEntry = { id: "modal", params: { anything: true } };

        expect(genericScreen.route).toBe("any");
        expect(genericModal.id).toBe("modal");
    });
});
