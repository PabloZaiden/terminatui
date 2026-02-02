import { Command } from "../core/command.ts";
import { AppContext } from "../core/context.ts";
import { LogLevel } from "../core/logger.ts";
import type { OptionSchema, OptionValues } from "../types/command.ts";
import type { CommandResult } from "../core/command.ts";
import { getEnumKeys } from "../tui/utils/getEnumKeys.ts";
import { KNOWN_COMMANDS } from "../core/knownCommands.ts";

/**
 * Options schema for the settings command.
 */
const settingsOptions = {
  "log-level": {
    type: "string",
    description: "Minimum log level to emit",
    default: "info",
    enum: getEnumKeys(LogLevel) as (keyof typeof LogLevel)[],
    label: "Log Level",
    order: 1,
  },
  "detailed-logs": {
    type: "boolean",
    description: "Include timestamp and level in log output",
    default: false,
    label: "Detailed Logs",
    order: 2,
  },
} as const satisfies OptionSchema;

type SettingsOptions = OptionValues<typeof settingsOptions>;

/**
 * Parsed settings configuration.
 */
interface SettingsConfig {
  logLevel: LogLevel;
  detailedLogs: boolean;
}

/**
 * Built-in settings command for configuring logging.
 * 
 * This command allows users to configure the log level and detailed logging
 * format at runtime. It's automatically registered by TuiApplication.
 * 
 * In CLI mode, these settings are typically passed as global options:
 * --log-level <level> and --detailed-logs
 * 
 * In TUI mode, this command provides a UI for configuring these settings.
 */
export class SettingsCommand extends Command<typeof settingsOptions, SettingsConfig> {
  override supportsCli(): boolean {
    return false;
  }

  readonly name = KNOWN_COMMANDS.settings;
  override readonly displayName = "Settings";
  override readonly tuiHidden = true;
  readonly description = "Configure logging level and output format";
  readonly options = settingsOptions;

  override readonly actionLabel = "Save Settings";
  override readonly immediateExecution = false;

  override buildConfig(opts: SettingsOptions): SettingsConfig {
    const logLevelStr = opts["log-level"];
    const logLevel = LogLevel[logLevelStr as keyof typeof LogLevel] ?? LogLevel.info;
    const detailedLogs = Boolean(opts["detailed-logs"]);

    return { logLevel, detailedLogs };
  }

  override async execute(config: SettingsConfig): Promise<CommandResult> {
    this.applySettings(config);
    return {
      success: true,
      message: `Logging set to ${LogLevel[config.logLevel]}${config.detailedLogs ? " with detailed format" : ""}`,
    };
  }

  private applySettings(config: SettingsConfig): void {
    AppContext.current.logger.setMinLevel(config.logLevel);
    AppContext.current.logger.setDetailed(config.detailedLogs);
  }
}

/**
 * Create the built-in settings command.
 */
export function createSettingsCommand(): SettingsCommand {
  return new SettingsCommand();
}
