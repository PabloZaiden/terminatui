## General guidelines

- Never use `git` operations. That's up to the user.
- Always prefer simplicity, usability and top level type safety over cleverness.
- Don't create index.ts files that re-export things from other files. Always import directly from the file you need.
- Prefer classes over standalone functions when it makes sense.
- Before doing something, check the patterns used in the rest of the codebase.
- Never use `import("...")` dynamic imports. Always use static imports (unless absolutely necessary).

## Workflow

- Always make sure you have all your goals written down in a document and agreed upon before starting to code.
- Always use the ToDo functionality to keep track of the work you're doing, and the last ToDo should always be "verify that all goals are met according to the document, and update the ToDo again".
- Track the status of the work in that document.
- After checking the document, update what the next steps to work on are, and what's important to know about it to be able to continue working on it later.
- Make sure that the goals you are trying to achieve are written down, in a way that you can properly verify them later.
- Don't say something is done until you have verified that all the goals are met.
- The general loop then is:
  1. Write down the goals you want to achieve.
  2. Write the code to achieve those goals.
  3. Verify that all the goals are met.
  4. Update the document with the status of the work.
  5. If all goals are met, you are done.
  6. If not, go back to step 2.

## Bun specifics
This is a Bun-only project. Never check if something might not be supported in another environment. You can assume Bun is always available.

Always use Bun features and APIs where possible.

- Use `bun <file>` instead of `node <file>` or `ts-node <file>`
- Use `bun test` instead of `jest` or `vitest`
- Use `bun build <file.html|file.ts|file.css>` instead of `webpack` or `esbuild`
- Use `bun install` instead of `npm install` or `yarn install` or `pnpm install`
- Use `bun run <script>` instead of `npm run <script>` or `yarn run <script>` or `pnpm run <script>`
- Use `bunx <package> <command>` instead of `npx <package> <command>`
- Bun automatically loads .env, so don't use dotenv.

## APIs

- Prefer `Bun.file` over `node:fs`'s readFile/writeFile
- Bun.$`ls` instead of execa.

## Testing

Always run `bun run build` before running tests, to make sure there are no build errors.
Use `bun run test` to run all the tests.

Always run `bun run test` when you think you are done making changes.

```ts#index.test.ts
import { test, expect } from "bun:test";

test("hello world", () => {
  expect(1).toBe(1);
});
```

For more information, read the Bun API docs in `node_modules/bun-types/docs/**.mdx`.
