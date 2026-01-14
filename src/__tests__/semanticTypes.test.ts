import { test, expect } from "bun:test";
import { SemanticColors } from "../tui/theme.ts";

test("SemanticColors provides required semantic colors", () => {
    expect(SemanticColors.background).toBeTypeOf("string");
    expect(SemanticColors.border).toBeTypeOf("string");
    expect(SemanticColors.value).toBeTypeOf("string");
});
