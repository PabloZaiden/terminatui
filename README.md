# @pablozaiden/terminatui

A type-safe, class-based framework for building CLI and TUI applications in TypeScript with Bun.

## Features

- **Type-safe CLI parsing** - Define options with schemas that provide full TypeScript types
- **Class-based architecture** - Extend `Command` and `Application` classes for structured apps
- **Unified execution** - Single `execute()` method handles both CLI and TUI modes
- **Auto-generated TUI** - Interactive terminal UI generated from command definitions
- **Built-in commands** - Automatic `help` and `version` commands
- **Nested subcommands** - Hierarchical command structures with path resolution
- **Lifecycle hooks** - `beforeExecute()` and `afterExecute()` hooks on commands
- **Service container** - `AppContext` provides dependency injection for services
- **Integrated logging** - Logger with TUI-aware output handling (live log modal with global copy shortcut)
- **Cancellation support** - AbortSignal-based cancellation for long-running commands
- **Config validation** - `buildConfig()` hook for transforming and validating options

## Prerequisites

- [Bun](https://bun.com)

## Installation

```bash
bun add @pablozaiden/terminatui
```

## Quick Start

### 1. Define a Command

```typescript
import {
  Command,
  type OptionSchema,
  type CommandResult,
  type CommandExecutionContext,
} from "@pablozaiden/terminatui";

const greetOptions = {
  name: {
    type: "string",
    description: "Name to greet",
    required: true,
  },
  loud: {
    type: "boolean",
    description: "Use uppercase",
    alias: "l",
    default: false,
  },
} satisfies OptionSchema;

class GreetCommand extends Command<typeof greetOptions> {
  readonly name = "greet";
  readonly description = "Greet someone";
  readonly options = greetOptions;

  override execute(
    config: { name: string; loud: boolean },
    _execCtx: CommandExecutionContext
  ): CommandResult {
    const message = `Hello, ${config.name}!`;
    console.log(config.loud ? message.toUpperCase() : message);
    return { success: true, message };
  }
}
```

### 2. Create an Application

```typescript
import { Application } from "@pablozaiden/terminatui";

class MyApp extends Application {
  constructor() {
    super({
      name: "myapp",
      version: "1.0.0",
      description: "My awesome CLI app",
      commands: [new GreetCommand()],
    });
  }
}
```

### 3. Run the Application

```typescript
// index.ts
// Recommended: let Terminatui read `Bun.argv.slice(2)`
await new MyApp().run();

// For tests or programmatic invocation:
// await new MyApp().runFromArgs(["greet", "--name", "World"]);
```

```bash
# Usage
myapp greet --name World
# Output: Hello, World!

myapp greet --name World --loud
# Output: HELLO, WORLD!

myapp help
# Shows all commands

myapp greet help
# Shows greet command options
```

## Core Concepts

### Command

The `Command` abstract class is the base for all commands:

```typescript
abstract class Command<TOptions extends OptionSchema = OptionSchema, TConfig = unknown> {
  abstract readonly name: string;
  abstract readonly description: string;
  abstract readonly options: TOptions;
  
  // Optional properties
  displayName?: string;           // Human-readable name for TUI
  subCommands?: Command[];        // Nested subcommands
  examples?: CommandExample[];    // Usage examples
  longDescription?: string;       // Extended description
  
  // TUI customization
  actionLabel?: string;           // Button text (default: "Run")
  immediateExecution?: boolean;   // Execute on selection without config
  tuiHidden?: boolean;            // Hide from TUI command list
  
  // Required: Main execution method
  abstract execute(
    config: TConfig,
    execCtx: CommandExecutionContext
  ): Promise<CommandResult | void> | CommandResult | void;
  
  // Optional: Transform/validate options before execute
  buildConfig?(opts: OptionValues<TOptions>): TConfig | Promise<TConfig>;
  
  // Optional: Custom result rendering for TUI
  renderResult?(result: CommandResult): ReactNode;
  
  // Optional: Custom clipboard content
  getClipboardContent?(result: CommandResult): string | undefined;
  
  // Optional: Handle config changes in TUI form
  onConfigChange?(key: string, value: unknown, allValues: Record<string, unknown>): Record<string, unknown> | undefined;
}
```

### CommandExecutionContext

Provides execution context including cancellation support:

```typescript
interface CommandExecutionContext {
  signal: AbortSignal;  // For cancellation
}
```

### CommandResult

Commands should return a `CommandResult` from `execute()`:

```typescript
interface CommandResult {
  success: boolean;
  data?: unknown;         // Result data
  error?: string;         // Error message if failed
  message?: string;       // User-friendly message
}
```

### Application

The `Application` class manages command registration and execution:

```typescript
class Application {
  constructor(config: ApplicationConfig);

  // Recommended entrypoint (reads `Bun.argv.slice(2)`)
  run(): Promise<void>;

  // Useful for tests or programmatic invocation
  runFromArgs(argv: string[]): Promise<void>;

  // Set lifecycle hooks
  setHooks(hooks: ApplicationHooks): void;
}

interface ApplicationHooks {
  /** Called before running any command */
  onBeforeRun?: (commandName: string) => Promise<void> | void;
  /** Called after command completes (success or failure) */
  onAfterRun?: (commandName: string, error?: Error) => Promise<void> | void;
  /** Called when an error occurs */
  onError?: (error: Error) => Promise<void> | void;
}

interface ApplicationConfig {
  name: string;
  version: string;
  displayName?: string;   // Human-readable name for TUI header
  commitHash?: string;    // Git commit for version display
  description?: string;
  commands: Command[];
  defaultCommand?: string;
}
```

### AppContext

Access application-wide services and configuration:

```typescript
import { AppContext } from "@pablozaiden/terminatui";
import type { CommandExecutionContext } from "@pablozaiden/terminatui";
import { AbortError } from "@pablozaiden/terminatui";

// Get the current context (set during Application.run())
const ctx = AppContext.current;

// Access the logger
ctx.logger.info("Hello");
ctx.logger.warn("Warning");
ctx.logger.error("Error");

// Access app config
console.log(ctx.config.name, ctx.config.version);

// Register and retrieve services
ctx.setService("myService", myServiceInstance);
const service = ctx.requireService<MyService>("myService");
```

### OptionSchema

Define typed options for commands:

```typescript
interface OptionDef {
  type: "string" | "boolean" | "number" | "array";
  description: string;
  required?: boolean;
  default?: unknown;
  alias?: string;
  enum?: readonly string[];  // For string type, restrict to values
  env?: string;              // Environment variable to read from
  min?: number;              // Minimum value (for number type)
  max?: number;              // Maximum value (for number type)
  
  // TUI metadata
  label?: string;            // Custom label in form
  order?: number;            // Field ordering
  group?: string;            // Group fields together
  placeholder?: string;      // Placeholder text
  tuiHidden?: boolean;       // Hide from TUI form
}

type OptionSchema = Record<string, OptionDef>; // See library types
```

## Config Validation with buildConfig

Use `buildConfig()` to transform and validate options before execution:

```typescript
import { Command, ConfigValidationError, type OptionValues } from "@pablozaiden/terminatui";

interface MyConfig {
  resolvedPath: string;
  count: number;
}

class MyCommand extends Command<typeof myOptions, MyConfig> {
  readonly name = "mycommand";
  readonly description = "Do something";
  readonly options = myOptions;

  override buildConfig(opts: OptionValues<typeof myOptions>): MyConfig {
    const pathRaw = opts["path"] as string | undefined;
    if (!pathRaw) {
      throw new ConfigValidationError("Missing required option: path", "path");
    }
    
    const count = parseInt(opts["count"] as string ?? "1", 10);
    if (isNaN(count) || count <= 0) {
      throw new ConfigValidationError("Count must be a positive integer", "count");
    }

    return {
      resolvedPath: path.resolve(pathRaw),
      count,
    };
  }

  override async execute(
    config: MyConfig,
    execCtx: CommandExecutionContext
  ): Promise<CommandResult> {
    // config is now typed as MyConfig
    if (execCtx.signal.aborted) {
      throw new AbortError("Command was cancelled");
    }

    AppContext.current.logger.info(`Processing ${config.count} items from ${config.resolvedPath}`);
    return { success: true };
  }
}
```

## Cancellation Support

Commands can support cancellation via AbortSignal:

```typescript
class LongRunningCommand extends Command<typeof options> {
  // ...

  override async execute(
    config: Config,
    execCtx: CommandExecutionContext
  ): Promise<CommandResult> {
    for (const item of items) {
      // Check for cancellation
      if (execCtx.signal.aborted) {
        throw new AbortError("Command was cancelled");
      }

      await processItem(item, execCtx.signal);
    }

    return { success: true };
  }
}
```

## Subcommands

Commands can have nested subcommands:

```typescript
class DbCommand extends Command {
  name = "db";
  description = "Database operations";
  
  subCommands = [
    new DbMigrateCommand(),
    new DbSeedCommand(),
  ];
}

// Usage: myapp db migrate
//        myapp db seed
```

## Built-in Commands

The framework automatically injects:

- **`help`** - Shows command help (injected into every command as subcommand)
- **`version`** - Shows app version (top-level only)

```bash
myapp help           # App-level help
myapp greet help     # Command-level help
myapp version        # Shows version
```

## TUI Mode

Terminatui provides built-in TUI (Terminal User Interface) support that automatically generates interactive UIs from your command definitions.

### TuiApplication

Extend `TuiApplication` instead of `Application` to get automatic TUI support:

```typescript
import { TuiApplication, Command } from "@pablozaiden/terminatui";

class MyApp extends TuiApplication {
  // Each app decides what "default" means.
  protected override defaultMode = "opentui" as const;

  constructor() {
    super({
      name: "myapp",
      displayName: "🚀 My App",  // Human-readable name for TUI header
      version: "1.0.0",
      commands: [new RunCommand(), new ConfigCommand()],
    });
  }
}
```

### Execution Modes

Execution mode is controlled by the `--mode` flag or the app's configured `defaultMode`:

- **`Application`**: Only supports `cli` mode
- **`TuiApplication`**: Supports `cli`, `opentui`, and `ink` modes

Subclasses can restrict supported modes by overriding the `supportedModes` getter:

```typescript
class InkOnlyApp extends TuiApplication {
  protected override get supportedModes() {
    return ["ink"] as const;  // Only ink mode allowed
  }
  protected override defaultMode = "ink" as const;
}
```

```bash
myapp                           # Uses app default mode
myapp --mode opentui            # Forces TUI (OpenTUI)
myapp --mode ink                # Forces TUI (Ink)
myapp --mode cli run --verbose  # Forces CLI
```

Execution mode is controlled only by the selected mode (`--mode`) or the app’s configured default mode.

```bash
myapp                           # Uses app default mode
myapp --mode opentui            # Forces TUI (OpenTUI)
myapp --mode ink                # Forces TUI (Ink)
myapp --mode cli run --verbose  # Forces CLI
```

### TUI Metadata

Add TUI-specific metadata to your option schemas to customize the UI:

```typescript
const myOptions = {
  repo: {
    type: "string",
    description: "Repository path",
    required: true,
    // TUI metadata
    label: "Repository",    // Custom label in form
    order: 1,               // Field ordering
    group: "Required",      // Group fields together
    placeholder: "/path",   // Placeholder text
    tuiHidden: false,       // Hide from TUI form
  },
  verbose: {
    type: "boolean",
    description: "Verbose output",
    label: "Verbose Mode",
    order: 10,
    group: "Options",
  },
} satisfies OptionSchema;
```

### Command TUI Properties

Commands can customize their TUI behavior:

```typescript
class RunCommand extends Command<typeof runOptions, RunConfig> {
  readonly name = "run";
  override readonly displayName = "Run Task";  // Shown in command selector
  readonly description = "Run the task";
  readonly options = runOptions;

  // TUI customization
  override readonly actionLabel = "Start Run";      // Button text
  override readonly immediateExecution = false;     // Run immediately on selection

  // Return structured results for display
   override async execute(config: RunConfig, _execCtx: CommandExecutionContext): Promise<CommandResult> {
     const result = await runTask(config);
     return {
       success: true,
       data: result,
       message: "Task completed",
     };
   }


  // Custom result rendering (React/TSX)
  override renderResult(result: CommandResult): ReactNode {
    return <MyCustomResultView data={result.data} />;
  }

  // Content for clipboard (Ctrl+Y in results view)
  override getClipboardContent(result: CommandResult): string | undefined {
    return JSON.stringify(result.data, null, 2);
  }
  
  // React to config changes in the TUI form
  override onConfigChange(
    key: string, 
    value: unknown, 
    allValues: Record<string, unknown>
  ): Record<string, unknown> | undefined {
    if (key === "preset" && value === "fast") {
      return { iterations: 1, parallel: true };
    }
    return undefined;
  }
}
```

### TUI Features

The built-in TUI provides:

- **Command Selector** - Navigate and select commands with arrow keys
- **Config Form** - Auto-generated forms from option schemas with field groups
- **Field Editor** - Edit field values (text, number, boolean, enum)
- **CLI Args** - View equivalent CLI command from the config form
- **Results Panel** - Display command results with custom rendering
- **Logs Panel** - View application logs in real-time
- **Clipboard Support** - Centralized copy with Ctrl+Y
- **Cancellation** - Cancel running commands with Esc
- **Parameter Persistence** - Remembers last-used values per command

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ↑/↓ | Navigate fields/commands |
| Enter | Edit field / Execute command / Press button |
| Tab | Cycle focus between panels |
| L | Toggle logs panel |
| Ctrl+Y | Copy current content to clipboard |
| Esc | Back / Cancel running command |

### TUI Utilities

The package exports utilities for building custom TUI components:

```typescript
import { 
  // Components
  JsonHighlight,         // Syntax-highlighted JSON display
} from "@pablozaiden/terminatui";
```

Note: Internal TUI hooks like `useCommandExecutor`, `useClipboard`, and form utilities are used internally by the framework but are not part of the public API.

## Output Formatting

Terminatui includes utilities for formatted CLI output:

```typescript
import { colors } from "@pablozaiden/terminatui";

// Colors
console.log(colors.red("Error!"));
console.log(colors.success("Done!"));  // ✓ Done!
console.log(colors.bold(colors.blue("Title")));
```

## License

MIT
