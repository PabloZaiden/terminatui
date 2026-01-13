import { test, expect } from "bun:test";
import { createRenderer } from "../tui/adapters/factory.ts";

test("createRenderer('ink') throws until implemented", async () => {
    await expect(createRenderer("ink", {})).rejects.toThrow(/not implemented/i);
});
