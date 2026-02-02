# Guide 0: Getting Started

Choose how you want to start building your Terminatui application.

## Option A: Quick Start with `bun create` (Recommended)

The fastest way to get started is using the create template:

```bash
bun create terminatui my-app
cd my-app
bun install
bun run start
```

This gives you a fully working application with:
- A sample `greet` command demonstrating options, TUI metadata, and result rendering
- TypeScript configuration with strict settings
- Dev container setup for containerized development
- Both CLI and TUI mode support out of the box

### Running the Generated App

```bash
# TUI mode (default) - interactive terminal interface
bun run start

# CLI mode - traditional command line
bun run start --mode cli greet --name World

# Show help
bun run start help
```

### What's Included

```
my-app/
├── src/
│   ├── index.ts              # App entry point with TuiApplication
│   └── commands/
│       └── greet.ts          # Sample command with full features
├── .devcontainer/            # VS Code dev container config
├── package.json
└── tsconfig.json
```

After exploring the generated app, check out [Guide 5: Interactive TUI](05-interactive-tui.md) to understand how the TUI features work, or continue below to learn the fundamentals.

---

## Option B: Manual Setup (Step by Step)

If you prefer to understand every piece or want to integrate Terminatui into an existing project, follow the step-by-step guides starting with [Guide 1: Hello World](01-hello-world.md).

### Quick Manual Setup

```bash
mkdir my-cli && cd my-cli
bun init -y
bun add @pablozaiden/terminatui
```

Then create your first command in `src/index.ts`:

```typescript
import { Command, Application, type OptionSchema, type CommandResult } from "@pablozaiden/terminatui";

const options = {
  name: { type: "string", description: "Your name" },
} satisfies OptionSchema;

class HelloCommand extends Command<typeof options> {
  readonly name = "hello";
  readonly description = "Say hello";
  readonly options = options;

  execute(config: { name?: string }): CommandResult {
    const name = config.name ?? "World";
    console.log(`Hello, ${name}!`);
    return { success: true };
  }
}

class MyCLI extends Application {
  constructor() {
    super({ name: "my-cli", version: "1.0.0", commands: [new HelloCommand()] });
  }
}

await new MyCLI().run();
```

Run it:

```bash
bun src/index.ts hello --name "Developer"
# Output: Hello, Developer!
```

---

## Which Option Should I Choose?

| If you want to... | Choose |
|-------------------|--------|
| Get started quickly with a working app | **Option A** (`bun create`) |
| Learn the framework step by step | **Option B** (Manual + Guides) |
| Add Terminatui to an existing project | **Option B** (Manual) |
| See TUI features immediately | **Option A** (`bun create`) |

---

## Next Steps

- **From Option A**: Explore the generated code, then see [Guide 5: Interactive TUI](05-interactive-tui.md)
- **From Option B**: Continue with [Guide 1: Hello World](01-hello-world.md)
