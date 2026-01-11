import { describe, test, expect } from "bun:test";
import type { Screen, NavigationAPI } from "../tui/context/NavigationContext.tsx";

describe("NavigationContext", () => {
    describe("Screen types", () => {
        test("CommandSelect screen type is valid", () => {
            const screen: Screen = {
                type: "CommandSelect",
            };
            expect(screen.type).toBe("CommandSelect");
        });

        test("CommandSelect with commandPath is valid", () => {
            const screen: Screen = {
                type: "CommandSelect",
                commandPath: ["config", "app"],
            };
            expect(screen.type).toBe("CommandSelect");
            expect(screen.commandPath).toEqual(["config", "app"]);
        });

        test("Config screen type is valid", () => {
            const screen: Screen = {
                type: "Config",
                commandName: "greet",
                commandPath: ["greet"],
            };
            expect(screen.type).toBe("Config");
            expect(screen.commandName).toBe("greet");
            expect(screen.commandPath).toEqual(["greet"]);
        });

        test("Running screen type is valid", () => {
            const screen: Screen = {
                type: "Running",
                commandName: "status",
            };
            expect(screen.type).toBe("Running");
            expect(screen.commandName).toBe("status");
        });

        test("Results screen type is valid", () => {
            const screen: Screen = {
                type: "Results",
                commandName: "math",
                success: true,
            };
            expect(screen.type).toBe("Results");
            expect(screen.commandName).toBe("math");
            expect(screen.success).toBe(true);
        });

        test("Error screen type is valid", () => {
            const error = new Error("Test error");
            const screen: Screen = {
                type: "Error",
                commandName: "failing",
                error,
            };
            expect(screen.type).toBe("Error");
            expect(screen.commandName).toBe("failing");
            expect(screen.error).toBe(error);
        });
    });

    describe("NavigationAPI interface", () => {
        test("NavigationAPI has required properties", () => {
            // Type test - this will fail at compile time if interface is wrong
            const mockAPI: NavigationAPI = {
                currentScreen: { type: "CommandSelect" },
                stack: [{ type: "CommandSelect" }],
                push: () => {},
                pop: () => {},
                replace: () => {},
                reset: () => {},
                canGoBack: false,
            };
            
            expect(mockAPI.currentScreen).toBeDefined();
            expect(mockAPI.stack).toBeDefined();
            expect(typeof mockAPI.push).toBe("function");
            expect(typeof mockAPI.pop).toBe("function");
            expect(typeof mockAPI.replace).toBe("function");
            expect(typeof mockAPI.reset).toBe("function");
            expect(typeof mockAPI.canGoBack).toBe("boolean");
        });
    });

    describe("stack operations", () => {
        test("simulates push operation", () => {
            // Simulate the logic of push
            const stack: Screen[] = [{ type: "CommandSelect" }];
            const newScreen: Screen = {
                type: "Config",
                commandName: "test",
                commandPath: ["test"],
            };
            
            const newStack = [...stack, newScreen];
            
            expect(newStack.length).toBe(2);
            expect(newStack[0]).toEqual({ type: "CommandSelect" });
            expect(newStack[1]).toEqual(newScreen);
        });

        test("simulates pop operation", () => {
            // Simulate the logic of pop
            let stack: Screen[] = [
                { type: "CommandSelect" },
                { type: "Config", commandName: "test", commandPath: ["test"] },
            ];
            
            // Pop when stack has multiple items
            stack = stack.slice(0, -1);
            expect(stack.length).toBe(1);
            expect(stack[0]).toEqual({ type: "CommandSelect" });
            
            // Attempt to pop when stack has one item
            const singleStack = [{ type: "CommandSelect" }];
            const result = singleStack.length <= 1 ? singleStack : singleStack.slice(0, -1);
            expect(result.length).toBe(1);
        });

        test("simulates replace operation", () => {
            // Simulate the logic of replace
            const stack: Screen[] = [
                { type: "CommandSelect" },
                { type: "Config", commandName: "test", commandPath: ["test"] },
            ];
            const newScreen: Screen = { type: "Running", commandName: "test" };
            
            const newStack = [...stack.slice(0, -1), newScreen];
            
            expect(newStack.length).toBe(2);
            expect(newStack[0]).toEqual({ type: "CommandSelect" });
            expect(newStack[1]).toEqual(newScreen);
        });

        test("simulates reset operation", () => {
            // Simulate the logic of reset
            const oldStack: Screen[] = [
                { type: "CommandSelect" },
                { type: "Config", commandName: "test1", commandPath: ["test1"] },
                { type: "Running", commandName: "test1" },
            ];
            const newScreen: Screen = { type: "CommandSelect", commandPath: [] };
            
            const newStack = [newScreen];
            
            expect(oldStack.length).toBe(3); // Old stack had 3 items
            expect(newStack.length).toBe(1);
            expect(newStack[0]).toEqual(newScreen);
        });

        test("canGoBack logic", () => {
            // When stack has one item
            expect([{ type: "CommandSelect" }].length > 1).toBe(false);
            
            // When stack has multiple items
            expect([
                { type: "CommandSelect" },
                { type: "Config", commandName: "test", commandPath: ["test"] },
            ].length > 1).toBe(true);
        });

        test("stack never becomes empty logic", () => {
            // Simulates the logic that prevents empty stack
            const stack: Screen[] = [{ type: "CommandSelect" }];
            
            // Attempting to pop when only one item
            const result = stack.length <= 1 ? stack : stack.slice(0, -1);
            
            expect(result.length).toBeGreaterThanOrEqual(1);
        });

        test("complex navigation scenario simulation", () => {
            // Simulate a complex navigation flow
            let stack: Screen[] = [{ type: "CommandSelect" }];
            
            // Push Config screen
            stack = [...stack, {
                type: "Config",
                commandName: "test",
                commandPath: ["test"],
            }];
            expect(stack.length).toBe(2);
            
            // Replace with Running
            stack = [...stack.slice(0, -1), {
                type: "Running",
                commandName: "test",
            }];
            expect(stack.length).toBe(2);
            expect(stack[stack.length - 1]!.type).toBe("Running");
            
            // Replace with Results
            stack = [...stack.slice(0, -1), {
                type: "Results",
                commandName: "test",
                success: true,
            }];
            expect(stack.length).toBe(2);
            expect(stack[stack.length - 1]!.type).toBe("Results");
            
            // Pop back to CommandSelect
            stack = stack.length <= 1 ? stack : stack.slice(0, -1);
            expect(stack.length).toBe(1);
            expect(stack[0]!.type).toBe("CommandSelect");
            
            // Reset
            stack = [{ type: "CommandSelect", commandPath: [] }];
            expect(stack.length).toBe(1);
            expect(stack.length > 1).toBe(false); // canGoBack = false
        });
    });
});
