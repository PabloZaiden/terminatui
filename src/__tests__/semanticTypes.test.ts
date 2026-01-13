import { test, expect } from "bun:test";
import type { ThemeConfig } from "../tui/semantic/types.ts";
import { Theme } from "../tui/theme.ts";

test("Theme provides semantic colors", () => {
    const theme: ThemeConfig = Theme;

    expect(theme.colors.background).toBeTypeOf("string");
    expect(theme.colors.border).toBeTypeOf("string");
    expect(theme.colors.value).toBeTypeOf("string");
});
