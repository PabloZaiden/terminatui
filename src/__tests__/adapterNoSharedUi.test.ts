import { expect, test } from "bun:test";
import { Glob } from "bun";
import { fileURLToPath } from "node:url";

const adaptersDir = fileURLToPath(new URL("../tui/adapters", import.meta.url));

async function getAdapterSourceFiles(): Promise<string[]> {
	const glob = new Glob("**/*.{ts,tsx}");
	const files: string[] = [];
	for await (const file of glob.scan({ cwd: adaptersDir, absolute: true })) {
		// skip shared behavior (allowed)
		if (!file.includes("/shared/")) {
			files.push(file);
		}
	}
	return files;
}

test("Adapters must not import src/tui/components/*", async () => {
	const files = await getAdapterSourceFiles();
	expect(files.length).toBeGreaterThan(0);

	const forbidden = /from\s+['"][^'"]*tui\/components\//;

	for (const filePath of files) {
		const source = await Bun.file(filePath).text();
		const match = source.match(forbidden);
		if (match) {
			throw new Error(
				`Adapter file imports shared component:\n  File: ${filePath}\n  Match: ${match[0]}`
			);
		}
	}
});
