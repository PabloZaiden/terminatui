# Guide 5: Interactive TUI

Add an auto-generated Terminal User Interface to your CLI.

## What You'll Build

A task runner with both CLI and interactive TUI modes:

```bash
# CLI mode
taskr --mode cli run --task build --env production

# TUI mode
# (if your app's default mode is a TUI mode)
 taskr

# Force TUI mode
 taskr --mode opentui
 # or
 taskr --mode ink

# Force CLI mode
 taskr --mode cli
```

Only the selected mode (`--mode`) or your app's default mode controls whether the app runs in CLI or TUI.

## Step 1: Create the Command with TUI Metadata

Create `src/commands/run.ts`:

```typescript
import {
  Command,
  type OptionSchema,
  type CommandResult,
  type CommandExecutionContext,
} from "@pablozaiden/terminatui";

const options = {
  task: {
    type: "string",
    description: "Task to run",
    required: true,
    enum: ["build", "test", "lint", "deploy"],
    // TUI metadata
    label: "Task",
    order: 1,
    group: "Required",
  },
  env: {
    type: "string",
    description: "Environment",
    default: "development",
    enum: ["development", "staging", "production"],
    // TUI metadata
    label: "Environment",
    order: 2,
    group: "Configuration",
  },
  verbose: {
    type: "boolean",
    description: "Verbose output",
    default: false,
    // TUI metadata
    label: "Verbose Mode",
    order: 10,
    group: "Options",
  },
} satisfies OptionSchema;

interface RunConfig {
  task: string;
  env: string;
  verbose: boolean;
}

export class RunCommand extends Command<typeof options, RunConfig> {
  readonly name = "run";
  readonly description = "Run a task";
  readonly options = options;

  // TUI customization
  override readonly displayName = "Run Task";
  override readonly actionLabel = "Start Task";

  async execute(config: RunConfig, _execCtx: CommandExecutionContext): Promise<CommandResult> {
    if (config.verbose) {
      console.debug(`Environment: ${config.env}`);
    }

    // Simulate task execution
    console.log(`Running ${config.task} in ${config.env}...`);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    console.log("Task completed!");

    return {
      success: true,
      data: { task: config.task, env: config.env },
      message: `Task ${config.task} completed successfully`,
    };
  }
}
```

## Step 2: Create the TUI Application

Create `src/index.ts`:

```typescript
import { TuiApplication } from "@pablozaiden/terminatui";
import { RunCommand } from "./commands/run";

class TaskRunnerApp extends TuiApplication {
  // Each app decides what "default" means.
  protected override defaultMode = "opentui" as const;

  constructor() {
    super({
      name: "taskr",
      displayName: "🚀 Task Runner", // Shown in TUI header
      version: "1.0.0",
      commands: [new RunCommand()],
    });
  }
}

await new TaskRunnerApp().run();
```

### Execution Modes

`TuiApplication` supports three execution modes: `cli`, `opentui`, and `ink`.

You can restrict which modes are supported by overriding `supportedModes`:

```typescript
class InkOnlyApp extends TuiApplication {
  protected override get supportedModes() {
    return ["ink"] as const;  // Only ink mode allowed
  }
  protected override defaultMode = "ink" as const;
}
```

## Step 3: Test Both Modes

**CLI Mode** (forced):

```bash
bun src/index.ts --mode cli run --task build --env production
# Running build in production...
# Task completed!
```

**TUI Mode** (forced):

```bash
bun src/index.ts --mode opentui
```

This opens an interactive interface:
- Use ↑/↓ to navigate fields
- Press Enter to edit a field
- Navigate to "CLI Command" button and press Enter to see the CLI command
- Press Enter on "Start Task" to run
- Press Esc to go back

## TUI Metadata Reference

Add these properties to your options for TUI customization:

```typescript
{
  type: "string",
  description: "...",

  // TUI-specific
  label: "Display Label", // Custom field label
  order: 1, // Field sort order
  group: "Settings", // Group heading
  placeholder: "Enter...", // Placeholder text
  tuiHidden: false, // Hide from TUI (still in CLI)
}
```

## Command TUI Properties

```typescript
class MyCommand extends Command {
  // Display name in command selector
  override readonly displayName = "My Command";

  // Button text (default: "Run")
  override readonly actionLabel = "Execute";

  // Skip config screen, run immediately
  override readonly immediateExecution = false;
}
```

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| ↑/↓ | Navigate fields |
| Enter | Edit field / Press button / Run |
| Tab | Cycle focus |
| L | Toggle logs |
| Ctrl+Y | Copy to clipboard |
| Esc | Back / Cancel |

## What You Learned

- Use `TuiApplication` instead of `Application`
- Use `--mode` (or app `defaultMode`) to control CLI vs TUI
- Add TUI metadata to options (label, order, group)
- Customize with `displayName` and `actionLabel`
- Both CLI and TUI work with the same command
- Restrict supported modes by overriding `supportedModes`

## Next Steps

→ [Guide 6: Config Validation](06-config-validation.md)
