import { expect, test } from "bun:test";

const tuiRootPath = new URL("../tui/TuiRoot.tsx", import.meta.url);

async function readTuiRootSource() {
	return await Bun.file(tuiRootPath).text();
}

test("TuiRoot stays a thin host (no domain helper imports)", async () => {
	const source = await readTuiRootSource();

	const forbiddenFragments = [
		"buildCliCommand",
		"schemaToFieldConfigs",
		"schemaToFields",
		"initializeConfigValues",
		"loadPersistedParameters",
		"savePersistedParameters",
		"getCommandsAtPath",
	];

	for (const fragment of forbiddenFragments) {
		expect(source).not.toContain(fragment);
	}
});
