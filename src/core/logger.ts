import { EventEmitter } from "events";
import { Logger as TsLogger, type IMeta } from "tslog";

/**
 * Log levels from least to most severe.
 */
export enum LogLevel {
  silly = 0,
  trace = 1,
  debug = 2,
  info = 3,
  warn = 4,
  error = 5,
  fatal = 6,
}

/**
 * Event emitted when a log message is written.
 */
export interface LogEvent {
  rawMessage: string;
  message: string;
  level: LogLevel;
  timestamp: Date;
}

/**
 * Logger configuration options.
 */
export interface LoggerConfig {
  /** Minimum log level to output */
  minLevel?: LogLevel;
  /** Whether to use detailed format (with timestamp/level) */
  detailed?: boolean;
  /** Whether to route logs to TUI event emitter instead of stderr */
  tuiMode?: boolean;
}

/**
 * Logger class that wraps tslog and supports TUI mode.
 * Can be instantiated multiple times for different contexts.
 */
export class Logger {
  private tsLogger: TsLogger<unknown>;
  private readonly eventEmitter = new EventEmitter();
  private detailed: boolean;
  private minLevel: LogLevel;

  constructor(config: LoggerConfig = {}) {
    this.detailed = config.detailed ?? false;
    this.minLevel = config.minLevel ?? LogLevel.info;

    this.tsLogger = this.createTsLogger(this.minLevel);
  }

  private createTsLogger(minLevel: LogLevel): TsLogger<unknown> {
    return new TsLogger({
      type: "pretty",
      minLevel,
      overwrite: {
        transportFormatted: (
          logMetaMarkup: string,
          logArgs: unknown[],
          logErrors: string[],
          logMeta?: IMeta
        ) => {
          const baseLine = `${logMetaMarkup}${(logArgs as string[]).join(" ")}${logErrors.join("")}`;
          const simpleLine = `${(logArgs as string[]).join(" ")}${logErrors.join("")}`;
          const level = logMeta?.logLevelId as LogLevel ?? LogLevel.info;
          const output = this.detailed ? baseLine : simpleLine;

          this.eventEmitter.emit("log", {
            message: output,
            rawMessage: simpleLine,
            level: level,
            timestamp: new Date(),
          } satisfies LogEvent);
        },
      },
    });
  }

  /**
   * Subscribe to log events (for TUI mode).
   */
  onLogEvent(listener: (event: LogEvent) => void): () => void {
    this.eventEmitter.on("log", listener);
    return () => this.eventEmitter.off("log", listener);
  }

  /**
   * Enable or disable detailed log format.
   */
  setDetailed(enabled: boolean): void {
    this.detailed = enabled;
  }

  /**
   * Set the minimum log level.
   */
  setMinLevel(level: LogLevel): void {
    this.minLevel = level;
    this.tsLogger = this.createTsLogger(level);
  }

  /**
   * Get the current minimum log level.
   */
  getMinLevel(): LogLevel {
    return this.minLevel;
  }

  // Logging methods
    silly(...args: unknown[]): void {
    this.tsLogger.silly(...asStringArray(args));
  }

  trace(...args: unknown[]): void {
    this.tsLogger.trace(...asStringArray(args));
  }

  debug(...args: unknown[]): void {
    this.tsLogger.debug(...asStringArray(args));
  }

  info(...args: unknown[]): void {
    this.tsLogger.info(...asStringArray(args));
  }

  warn(...args: unknown[]): void {
    this.tsLogger.warn(...asStringArray(args));
  }

  error(...args: unknown[]): void {
    this.tsLogger.error(...asStringArray(args));
  }

  fatal(...args: unknown[]): void {
    this.tsLogger.fatal(...asStringArray(args));
  }
}

function asStringArray(args: unknown[]): string[] {
  return args.map(arg => {
    if (typeof arg === "string") {
      return arg;
    }
    try {
      return JSON.stringify(arg);
    } catch {
      return String(arg);
    }
  });
}

/**
 * Create a new logger instance with the given configuration.
 */
export function createLogger(config: LoggerConfig = {}): Logger {
  return new Logger(config);
}
