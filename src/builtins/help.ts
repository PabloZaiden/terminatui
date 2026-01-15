import { Command, type AnyCommand } from "../core/command.ts";
import { generateCommandHelp, generateAppHelp } from "../core/help.ts";
import { KNOWN_COMMANDS } from "../core/knownCommands.ts";
import type { OptionSchema } from "../types/command.ts";
import { GLOBAL_OPTIONS_SCHEMA } from "../core/application.ts";

/**
 * Built-in help command that is auto-injected as a subcommand into all commands.
 * When invoked, it displays help for the parent command.
 * 
 * This command is created internally by the Application class and should not
 * be instantiated directly.
 */
export class HelpCommand extends Command<OptionSchema> {
  readonly name = KNOWN_COMMANDS.help;
  readonly description = "Show help for this command";
  override readonly tuiHidden = true;
  readonly options = {} as const;

  private parentCommand: AnyCommand | null = null;
  private allCommands: AnyCommand[] = [];
  private appName: string;
  private appVersion: string;

  constructor(config: {
    parentCommand?: AnyCommand;
    allCommands?: AnyCommand[];
    appName: string;
    appVersion: string;
  }) {
    super();
    this.parentCommand = config.parentCommand ?? null;
    this.allCommands = config.allCommands ?? [];
    this.appName = config.appName;
    this.appVersion = config.appVersion;
  }

  /**
   * Help command is CLI-only (auto-injected for CLI use, not shown in TUI).
   */
  override supportsTui(): boolean {
    return false;
  }

  override async execute(): Promise<void> {
    let helpText: string;

    if (this.parentCommand) {
      // Show help for the parent command
      helpText = generateCommandHelp(this.parentCommand, {
        appName: this.appName,
        version: this.appVersion,
        globalOptionsSchema: GLOBAL_OPTIONS_SCHEMA,
      });
    } else {
      // Show help for the entire application
      const visibleCommands = this.allCommands.filter(
        (cmd) => !cmd.tuiHidden || cmd.supportsCli()
      );

      helpText = generateAppHelp(visibleCommands, {
        appName: this.appName,
        version: this.appVersion,
        globalOptionsSchema: GLOBAL_OPTIONS_SCHEMA,
      });
    }

    console.log(helpText);
  }
}

/**
 * Create a help command for a specific parent command.
 */
export function createHelpCommandForParent(
  parentCommand: AnyCommand,
  appName: string,
  appVersion: string
): HelpCommand {
  return new HelpCommand({
    parentCommand,
    appName,
    appVersion,
  });
}

/**
 * Create a help command for the application root.
 */
export function createRootHelpCommand(
  allCommands: AnyCommand[],
  appName: string,
  appVersion: string
): HelpCommand {
  return new HelpCommand({
    allCommands,
    appName,
    appVersion,
  });
}
