import { type Logger, createLogger, type LoggerConfig, type LogEvent } from "./logger.ts";
import { appendFileSync, existsSync, mkdirSync } from "fs";
import { homedir } from "os";
import { join } from "path";

/**
 * Application configuration stored in context.
 */
export interface AppConfig {
  /** Application name */
  name: string;
  /** Application version */
  version: string;
  /** Log target */
  logTarget?: LogTarget[];
  /** Additional configuration values */
  [key: string]: unknown;
}

export type LogTarget = "memory" | "file" | "none";

/**
 * AppContext is the central container for application-wide services and state.
 * It holds the logger, configuration, and a generic service registry.
 * 
 * Access the current context via `AppContext.current` or receive it
 * as a parameter in command execute methods.
 */
export class AppContext {
  private static _current: AppContext | null = null;
  private readonly services = new Map<string, unknown>();
  private readonly startTime = Date.now();

  /** The application logger */
  public readonly logger: Logger;

  /** The application configuration */
  public readonly config: AppConfig;

  public logTarget: LogTarget[] = [];

  public readonly logHistory: LogEvent[] = [];

  constructor(config: AppConfig, loggerConfig?: LoggerConfig) {
    this.config = config;
    this.logger = createLogger(loggerConfig);
    this.logTarget = config.logTarget ?? ["none"];

    this.logger.onLogEvent((event) => {
      if (this.logTarget.includes("memory")) {
        this.logHistory.push(event);
      }

      if (this.logTarget.includes("file")) {
        const logFileName = `${this.config.name}-${this.startTime}.log`;
        const logLine = event.message + "\n";

        appendFileSync(logFileName, logLine);
      }
    });
  }

  /**
   * Get the current application context.
   * Throws if no context has been set.
   */
  static get current(): AppContext {
    if (!AppContext._current) {
      // return a fake context to avoid optional chaining everywhere
      return new AppContext({ name: "unknown", version: "0.0.0" });
    }
    return AppContext._current;
  }

  /**
   * Set the current application context.
   * Called internally by Application.
   */
  static setCurrent(context: AppContext): void {
    if (!context) {
      throw new Error("Cannot set null or undefined context");
    }

    AppContext._current = context;
  }

  /**
   * Register a service in the context.
   * @param name Unique service identifier
   * @param service The service instance
   */
  setService<T>(name: string, service: T): void {
    this.services.set(name, service);
  }

  /**
   * Get a service from the context.
   * @param name Service identifier
   * @returns The service instance or undefined
   */
  getService<T>(name: string): T | undefined {
    return this.services.get(name) as T | undefined;
  }

  /**
   * Get a service, throwing if not found.
   * @param name Service identifier
   * @returns The service instance
   */
  requireService<T>(name: string): T {
    const service = this.getService<T>(name);
    if (service === undefined) {
      throw new Error(`Service '${name}' not found in AppContext`);
    }
    return service;
  }

  /**
   * Check if a service is registered.
   * @param name Service identifier
   */
  hasService(name: string): boolean {
    return this.services.has(name);
  }

  /**
   * Get the directory path for storing app configuration and data.
   * Creates the directory if it doesn't exist.
   * 
   * The directory is located at `~/.{appName}` where `appName` is the
   * application name from the config.
   * 
   * @returns The path to the app config directory
   * 
   * @example
   * ```typescript
   * const configDir = AppContext.current.getConfigDir();
   * // Returns something like "/Users/john/.myapp"
   * 
   * // Store a file in the config directory
   * const filePath = join(configDir, "settings.json");
   * writeFileSync(filePath, JSON.stringify(data));
   * ```
   */
  getConfigDir(): string {
    const configDir = join(homedir(), `.${this.config.name}`);
    if (!existsSync(configDir)) {
      mkdirSync(configDir, { recursive: true });
    }
    return configDir;
  }
}
