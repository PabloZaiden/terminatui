#!/usr/bin/env bun

import { copyFileSync, mkdirSync, readdirSync, readlinkSync, symlinkSync } from "node:fs";
import { join, dirname, resolve } from "node:path";

const templateDir = resolve(dirname(import.meta.path), "../template");
const destDir = process.argv[2];

if (!destDir) {
    console.error("Usage: bun create terminatui <destination>");
    console.error("       bunx create-terminatui <destination>");
    process.exit(1);
}

function copyDir(src: string, dest: string): void {
    mkdirSync(dest, { recursive: true });
    for (const entry of readdirSync(src, { withFileTypes: true })) {
        const srcPath = join(src, entry.name);
        const destPath = join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDir(srcPath, destPath);
        } else if (entry.isSymbolicLink()) {
            const linkTarget = readlinkSync(srcPath);
            symlinkSync(linkTarget, destPath);
        } else {
            copyFileSync(srcPath, destPath);
        }
    }
}

console.log(`Creating TerminaTUI app in ${destDir}...`);
copyDir(templateDir, destDir);

console.log(`
Created TerminaTUI app in ${destDir}

Next steps:
  cd ${destDir}
  bun install
  bun run start

Documentation:
  https://github.com/PabloZaiden/terminatui
`);
