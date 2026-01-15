import { AppContext, type AppConfig } from "./context.ts";
import { type AnyCommand, ConfigValidationError, type CommandResult, type CommandExecutionContext } from "./command.ts";
import { CommandRegistry } from "./registry.ts";
import { ExecutionMode } from "../types/execution.ts";
import { LogLevel, type LoggerConfig } from "./logger.ts";
import {
  extractCommandChain,
  schemaToParseArgsOptions,
  parseOptionValues,
  validateOptions,
} from "../cli/parser.ts";
import type { OptionSchema } from "../types/command.ts";
import { parseArgs, type ParseArgsConfig } from "util";
import { createVersionCommand } from "../builtins/version.ts";
import { createHelpCommandForParent, createRootHelpCommand } from "../builtins/help.ts";
import { KNOWN_COMMANDS, RESERVED_TOP_LEVEL_COMMAND_NAMES } from "./knownCommands.ts";

/**
 * Global options available on all commands.
 * These are handled by the framework before dispatching to commands.
 */
export interface GlobalOptions {
  "log-level"?: string;
  "detailed-logs"?: boolean;
  "interactive"?: boolean;
  "renderer"?: "opentui" | "ink";
}

export const GLOBAL_OPTIONS_SCHEMA = {
  "log-level": {
    type: "string",
    description: "Minimum log level (e.g. info, debug)",
  },
  "detailed-logs": {
    type: "boolean",
    description: "Enable detailed logging",
    default: false,
  },
  interactive: {
    type: "boolean",
    alias: "i",
    description: "Run in interactive TUI mode",
  },
  renderer: {
    type: "string",
    enum: ["opentui", "ink"] as const,
    description: "Renderer to use for interactive mode",
  },
} satisfies OptionSchema;

/**
 * Application configuration options.
 */
export interface ApplicationConfig {
  /** Application name (used in CLI, help, version) */
  name: string;
  /** Display name for TUI (human-readable, e.g., "My App") */
  displayName?: string;
  /** Application version */
  version: string;
  /** Optional commit hash for version display (shows "(dev)" if not set) */
  commitHash?: string;
  /** Commands to register */
  commands: AnyCommand[];
  /** Default command when no args provided (by name) */
  defaultCommand?: string;
  /** Logger configuration */
  logger?: LoggerConfig;
  /** Additional config values */
  config?: Record<string, unknown>;
}

/**
 * Application lifecycle hooks.
 */
export interface ApplicationHooks {
  /** Called before running any command */
  onBeforeRun?: (commandName: string) => Promise<void> | void;
  /** Called after command completes (success or failure) */
  onAfterRun?: (commandName: string, error?: Error) => Promise<void> | void;
  /** Called when an error occurs */
  onError?: (error: Error) => Promise<void> | void;
}

/**
 * Main application class.
 * 
 * The Application is the entry point for a Terminatui-based CLI/TUI app.
 * It manages the command registry, context, lifecycle, and execution flow.
 * 
 * @example
 * ```typescript
 * const app = new Application({
 *   name: "myapp",
 *   version: "1.0.0",
 *   commands: [new RunCommand(), new CheckCommand()],
 *   defaultCommand: "interactive",
 * });
 * 
 * await app.run();
 * ```
 */
export class Application {
  readonly name: string;
  readonly displayName: string;
  readonly version: string;
  readonly commitHash?: string;
  readonly registry: CommandRegistry;

  private readonly defaultCommandName?: string;
  private hooks: ApplicationHooks = {};

  constructor(config: ApplicationConfig) {
    this.name = config.name;
    this.displayName = config.displayName ?? config.name;
    this.version = config.version;
    this.commitHash = config.commitHash;
    this.defaultCommandName = config.defaultCommand;

    // Create context
    const appConfig: AppConfig = {
      name: config.name,
      version: config.version,
      ...config.config,
    };
    const context = new AppContext(appConfig, config.logger);
    AppContext.setCurrent(context);

    context.logger.silly(`Application initialized: ${this.name} v${this.version}`);

    // Create registry and register commands
    this.registry = new CommandRegistry();
    this.registerCommands(config.commands);
  }

  /**
   * Register commands and inject help subcommands.
   */
  private registerCommands(commands: AnyCommand[]): void {
    this.assertNoReservedCommands(commands);

    // Register version command at top level
    this.registry.register(createVersionCommand(this.name, this.version, this.commitHash));

    // Register user commands with help injected
    for (const command of commands) {
      this.injectHelpCommand(command);
      this.registry.register(command);
    }

    // Register root help command
    // Use the full registry list so built-ins like `version` are included.
    this.registry.register(createRootHelpCommand(this.registry.list(), this.name, this.version));
  }

  private assertNoReservedCommands(commands: AnyCommand[]): void {
    for (const command of commands) {
      this.assertNoReservedCommand(command, []);
    }
  }

  private assertNoReservedCommand(command: AnyCommand, path: string[]): void {
    if (RESERVED_TOP_LEVEL_COMMAND_NAMES.has(command.name as never)) {
      throw new Error(
        `Command name '${command.name}' is reserved by Terminatui and cannot be registered`
      );
    }

    if (command.subCommands) {
      for (const subCommand of command.subCommands) {
        if (subCommand.name === KNOWN_COMMANDS.help) {
          const commandPath = [...path, command.name].join(" ");
          throw new Error(
            `Subcommand name '${KNOWN_COMMANDS.help}' is reserved and is automatically injected (found under '${commandPath}')`
          );
        }

        this.assertNoReservedCommand(subCommand, [...path, command.name]);
      }
    }
  }

  /**
   * Recursively inject help subcommand into a command and its subcommands.
   */
  private injectHelpCommand(command: AnyCommand): void {
    // Create help subcommand for this command
    const helpCmd = createHelpCommandForParent(command, this.name, this.version);

    // Initialize subCommands array if needed
    if (!command.subCommands) {
      command.subCommands = [];
    }

    // Add help as subcommand
    command.subCommands.push(helpCmd);

    // Recursively inject into subcommands
    for (const subCommand of command.subCommands) {
      if (subCommand.name !== KNOWN_COMMANDS.help) {
        this.injectHelpCommand(subCommand);
      }
    }

  }

  /**
   * Set lifecycle hooks.
   */
  setHooks(hooks: ApplicationHooks): void {
    this.hooks = { ...this.hooks, ...hooks };
  }

  /**
   * Run the application using Bun's process args.
   *
   * This is the common entrypoint for real apps.
   */
  async run(): Promise<void> {
    return this.runFromArgs(Bun.argv.slice(2));
  }

  /**
   * Run the application with explicit argv.
   *
   * Useful for tests or manual programmatic invocation.
   */
  async runFromArgs(argv: string[]): Promise<void> {
    // configure logger
    AppContext.current.logger.onLogEvent((event) => {
      process.stderr.write(event.message + "\n");
    });

    try {
      // Parse global options first
      const { globalOptions, remainingArgs } = this.parseGlobalOptions(argv);
      this.applyGlobalOptions(globalOptions);

      // Extract command path from args
      const { commands: commandPath, remaining: flagArgs } = extractCommandChain(remainingArgs);

      // Resolve command
      const { command, remainingPath } = this.resolveCommand(commandPath);

      if (!command) {
        // No command found - show help or run default
        if (this.defaultCommandName && commandPath.length === 0) {
          const defaultCmd = this.registry.get(this.defaultCommandName);
          if (defaultCmd) {
            await this.executeCommand(defaultCmd, flagArgs, []);
            return;
          }
        }

        // Show help
        const rootHelp = this.registry.get(KNOWN_COMMANDS.help);
        if (rootHelp) {
          await this.executeCommand(rootHelp, [], [KNOWN_COMMANDS.help]);
          return;
        }

        throw new Error("Root help command not registered");
      }

      // Check for unknown command in path
      if (remainingPath.length > 0 && remainingPath[0] !== KNOWN_COMMANDS.help) {
        AppContext.current.logger.error(`Unknown command: ${remainingPath.join(" ")}`);
        process.exitCode = 1;
        return;
      }

      // Execute the command
      await this.executeCommand(command, flagArgs, commandPath);
    } catch (error) {
      await this.handleError(error as Error);
    }
  }

  /**
   * Resolve a command from the path.
   */
  private resolveCommand(commandPath: string[]): {
    command: AnyCommand | undefined;
    remainingPath: string[];
  } {
    if (commandPath.length === 0) {
      return { command: undefined, remainingPath: [] };
    }

    const result = this.registry.resolve(commandPath);
    return {
      command: result.command,
      remainingPath: result.remainingPath,
    };
  }

  /**
   * Execute a command with full lifecycle.
   */
  private async executeCommand(
    command: AnyCommand,
    flagArgs: string[],
    commandPath: string[]
  ): Promise<void> {
    // Determine execution mode
    const mode = this.detectExecutionMode(command, flagArgs);

    // Parse options
    const schema = command.options ?? {};
    const parseArgsConfig = schemaToParseArgsOptions(schema);

    let parsedValues: Record<string, unknown> = {};

    const parseArgsOptions = {
      args: flagArgs,
      options: parseArgsConfig.options as ParseArgsConfig["options"],
      allowNegative: true,
      allowPositionals: false,
      strict: false,
    };

    const result = parseArgs(parseArgsOptions);
    parsedValues = result.values;

    let options;
    try {
      options = parseOptionValues(schema, parsedValues);
     } catch (err) {
       // Enum validation error from parseOptionValues
       AppContext.current.logger.error(`Error: ${(err as Error).message}\n`);
       await this.printHelpForCommand(command, commandPath);
       process.exitCode = 1;
       return;
     }


    // Validate options (required, min/max, etc.)
    const errors = validateOptions(schema, options);
    if (errors.length > 0) {
      for (const error of errors) {
        AppContext.current.logger.error(`Error: ${error.message}`);
      }
      await this.printHelpForCommand(command, commandPath);
      process.exitCode = 1;
      return;
    }

    // Call onBeforeRun hook
    if (this.hooks.onBeforeRun) {
      await this.hooks.onBeforeRun(command.name);
    }

    let error: Error | undefined;

    try {
      // Call beforeExecute hook on command
      if (command.beforeExecute) {
        await command.beforeExecute(options);
      }

      // Build config if command implements buildConfig, otherwise pass options as-is
      let config: unknown;
      if (command.buildConfig) {
        config = await command.buildConfig(options);
      } else {
        config = options;
      }

      // Execute the command with the config
      const ctx: CommandExecutionContext = { signal: new AbortController().signal };
      const result = await command.execute(config, ctx);

      // In CLI mode, handle result output
      if (mode === ExecutionMode.Cli && result) {
        const commandResult = result as CommandResult;
        if (commandResult.success) {
          // Output data as JSON to stdout if present
          if (commandResult.data !== undefined) {
            console.log(JSON.stringify(commandResult.data, null, 2));
          }
        } else {
          // Set exit code for failures
          process.exitCode = 1;
        }
      }
    } catch (e) {
      error = e as Error;
    } finally {
      // Always call afterExecute hook
      if (command.afterExecute) {
        try {
          await command.afterExecute(options, error);
        } catch (afterError) {
          // afterExecute error takes precedence if no prior error
          if (!error) {
            error = afterError as Error;
          }
        }
      }
    }

    // Call onAfterRun hook
    if (this.hooks.onAfterRun) {
      await this.hooks.onAfterRun(command.name, error);
    }

    // Re-throw if there was an error
    if (error) {
      throw error;
    }
  }

  private async printHelpForCommand(command: AnyCommand, commandPath: string[]): Promise<void> {
    const resolvedCommandPath = commandPath.length > 0 ? commandPath : [command.name];

    const helpCommand = command.subCommands?.find((sub) => sub.name === KNOWN_COMMANDS.help);
    if (!helpCommand) {
      throw new Error(`Help command not injected for '${resolvedCommandPath.join(" ")}'`);
    }

    await this.executeCommand(helpCommand, [], [...resolvedCommandPath, KNOWN_COMMANDS.help]);
  }

  /**
   * Detect the execution mode based on command and args.
   */
  private detectExecutionMode(command: AnyCommand, args: string[]): ExecutionMode {
    // If no args and command supports TUI, use TUI mode
    if (args.length === 0 && command.supportsTui()) {
      return ExecutionMode.Tui;
    }

    // Otherwise use CLI mode
    return ExecutionMode.Cli;
  }

  /**
   * Parse global options from argv.
   * Returns the parsed global options and remaining args.
   */
  protected parseGlobalOptions(argv: string[]): {
    globalOptions: GlobalOptions;
    remainingArgs: string[];
  } {
    const parseArgsConfig = schemaToParseArgsOptions(GLOBAL_OPTIONS_SCHEMA);

    const result = parseArgs({
      args: argv,
      options: parseArgsConfig.options as ParseArgsConfig["options"],
      allowPositionals: true,
      allowNegative: true,
      strict: false,
      tokens: true,
    });

    const rawGlobalOptions = parseOptionValues(GLOBAL_OPTIONS_SCHEMA, result.values) as GlobalOptions;

    const globalOptions: GlobalOptions = { ...rawGlobalOptions };
    
    const remainingArgs: string[] = [];
    for (const token of result.tokens ?? []) {
      if (token.kind === "positional") {
        remainingArgs.push(token.value);
        continue;
      }

      if (token.kind === "option") {
        const name = token.name;
        if (name && !(name in GLOBAL_OPTIONS_SCHEMA)) {
          remainingArgs.push(token.rawName);

          if (token.value !== undefined) {
            remainingArgs.push(String(token.value));
          } else if ("inlineValue" in token && (token as { inlineValue?: unknown }).inlineValue !== undefined) {
            remainingArgs.push(String((token as { inlineValue?: unknown }).inlineValue));
          }
        }
      }
    }

    return {
      globalOptions,
      remainingArgs,
    };
  }

  /**
   * Apply global options to the application context.
   */
  protected applyGlobalOptions(options: GlobalOptions): void {
    const logger = AppContext.current.logger;

    // Apply detailed-logs
    if (options["detailed-logs"] !== undefined) {
      logger.setDetailed(options["detailed-logs"]);
    }

    // Apply log-level (case-insensitive)
    if (options["log-level"] !== undefined) {
      const levelStr = options["log-level"].toLowerCase();
      // Find the matching log level (case-insensitive)
      const level = Object.entries(LogLevel).find(
        ([key, val]) => typeof val === "number" && key.toLowerCase() === levelStr
      )?.[1] as LogLevel | undefined;
      if (level !== undefined) {
        logger.setMinLevel(level);
      }
    }
  }

  /**
   * Handle an error during execution.
   */
  private async handleError(error: Error): Promise<void> {
    if (this.hooks.onError) {
      await this.hooks.onError(error);
    } else {
      // Default error handling
      if (error instanceof ConfigValidationError) {
        // Format validation errors more clearly
        const fieldInfo = error.field ? ` (${error.field})` : "";
        AppContext.current.logger.error(`Configuration error${fieldInfo}: ${error.message}`);
      } else {
        AppContext.current.logger.error(`Error: ${error.message}`);
      }
      process.exitCode = 1;
    }
  }
}
