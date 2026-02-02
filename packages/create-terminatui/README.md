# create-terminatui

Create template for [TerminaTUI](https://github.com/PabloZaiden/terminatui) CLI/TUI applications.

> **Note:** This package is part of the [terminatui monorepo](https://github.com/PabloZaiden/terminatui).

## Usage

### From npm (recommended)

```bash
bun create terminatui my-app
cd my-app
bun install
bun run start
```

### From GitHub

```bash
bun create github.com/pablozaiden/terminatui/packages/create-terminatui my-app
cd my-app
bun install
bun run start
```

> **Note:** The GitHub method includes extra files (publishing workflows, etc.). 
> Use the npm method for a cleaner experience.

## What's Included

The template creates a TerminaTUI application with:

- **TuiApplication** - An app that supports both CLI and TUI modes
- **Sample command** - A `greet` command demonstrating options, TUI metadata, and result rendering
- **TypeScript** - Strict TypeScript configuration
- **Dev container** - Ready for containerized development

## Running Your App

```bash
# TUI mode (default)
bun run start

# CLI mode
bun run start --mode cli greet --name World

# Show help
bun run start help
```

## Adding Commands

1. Create a new file in `src/commands/`
2. Define options with `OptionSchema`
3. Create a class extending `Command<typeof options>`
4. Add the command to your app in `src/index.ts`

See `src/commands/greet.ts` for a complete example.

## Documentation

- [TerminaTUI Repository](https://github.com/PabloZaiden/terminatui)
- [Guides](https://github.com/PabloZaiden/terminatui/tree/main/guides)

---

## Development (Contributing to this template)

This section is for developing the `create-terminatui` package itself.

### Setup

From the monorepo root:

```bash
bun install
```

### Available Scripts

Run from the `packages/create-terminatui` directory:

| Script | Description |
|--------|-------------|
| `bun run build` | Build the create script |
| `bun run test` | Run full test (create + build + run) |
| `bun run test:create` | Create a test app in `/tmp/terminatui-test-app` |
| `bun run test:template` | Build and run the test app in CLI mode |
| `bun run test:template:tui` | Run the test app in TUI mode |
| `bun run cleanup` | Remove the test app directory |

### Development Workflow

#### Test the full create flow

```bash
bun run cleanup                   # Clean up any previous test
bun run test                      # Create, build, and run test app
bun run test:template:tui         # Optionally test TUI mode
bun run cleanup                   # Clean up when done
```

### Publishing

Both `@pablozaiden/terminatui` and `create-terminatui` are published together when a GitHub release is created:

1. Create a GitHub release with a tag like `v1.0.0`
2. The workflow automatically:
   - Sets both packages to version `1.0.0`
   - Updates the template's terminatui dependency to `^1.0.0`
   - Publishes both packages to npm

### Key Files

- **`src/create-terminatui.ts`** - The create script that copies template files
- **`template/`** - All files in this directory are copied to the user's project
- **`template/src/commands/greet.ts`** - Sample command demonstrating all features

## License

MIT
