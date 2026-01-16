import { createRenderer } from "./adapters/factory.ts";
import { RendererProvider } from "./context/RendererContext.tsx";
import { Application, type ModeOptions, type ApplicationConfig, type TuiModeOptions } from "../core/application.ts";
import type { AnyCommand } from "../core/command.ts";
import { TuiRoot } from "./TuiRoot.tsx";
import { LogLevel } from "../core/logger.ts";
import { createSettingsCommand } from "../builtins/settings.ts";
import { KNOWN_COMMANDS } from "../core/knownCommands.ts";
import { loadPersistedParameters } from "./utils/parameterPersistence.ts";
import { AppContext } from "../core/context.ts";

/**
 * Extended configuration for TUI-enabled applications.
 */
export interface TuiApplicationConfig extends ApplicationConfig {
    /** Enable TUI mode (when renderer is opentui/ink/default) */
    enableTui?: boolean;
}

/**
 * Application class with built-in TUI support.
 * 
 * Extends the base Application to provide automatic TUI rendering
 * when running with `--renderer` set to a TUI renderer (or default).
 * 
 * @example
 * ```typescript
 * class MyApp extends TuiApplication {
 *   constructor() {
 *     super({
 *       name: "myapp",
 *       version: "1.0.0",
 *       commands: [new RunCommand(), new ConfigCommand()],
 *       enableTui: true,
 *     });
 *   }
 * }
 * 
 * await new MyApp().run();
 * ```
 */
export class TuiApplication extends Application {
    private readonly enableTui: boolean;

    constructor(config: TuiApplicationConfig) {
        super(config);
        this.enableTui = config.enableTui ?? true;
    }

    /**
     * Run the application.
     * 
     * If no arguments are provided and TUI is enabled, launches the TUI.
     * Otherwise, runs in CLI mode.
     */
    override async run(): Promise<void> {
        return this.runFromArgs(Bun.argv.slice(2));
    }

    override async runFromArgs(argv: string[]): Promise<void> {
        const { globalOptions } = this.parseGlobalOptions(argv);

        const mode = globalOptions["mode"] as ModeOptions ?? "default";
        const resolvedMode = mode === "default" ? this.defaultMode : mode;

        if (resolvedMode === "cli") {
            await super.runFromArgs(argv);
            return;
        }

        if (!this.enableTui) {
            throw new Error("TUI mode is disabled for this application");
        }

        if (resolvedMode === "opentui" || resolvedMode === "ink") {
            this.applyGlobalOptions(globalOptions);

            await this.runTui(resolvedMode);
            return;
        }

        throw new Error(`Unknown mode '${resolvedMode}'`);
    }

    /**
     * Launch the TUI.
     */
    async runTui(rendererType: TuiModeOptions): Promise<void> {
        // Get all commands that support TUI or have options
        const commands = this.getExecutableCommands();

        // Load and apply persisted settings (log-level, detailed-logs)
        this.loadPersistedSettings();

        const renderer = await createRenderer(rendererType, {
            useAlternateScreen: true,
        });

        return new Promise<void>((resolve) => {
            const handleExit = () => {
                renderer.destroy();
                resolve();
            };

            renderer.render(
                <RendererProvider renderer={renderer}>
                    <TuiRoot
                        name={this.name}
                        displayName={this.displayName}
                        version={this.version}
                        commands={commands}
                        onExit={handleExit}
                    />
                </RendererProvider>
            );
        });
    }

    /**
     * Load persisted settings and apply them to the logger.
     * Settings are saved when the user uses the Settings command.
     */
    private loadPersistedSettings(): void {
        try {
            const settings = loadPersistedParameters(this.name, KNOWN_COMMANDS.settings);

            // Apply log-level if set
            if (settings["log-level"]) {
                const levelStr = String(settings["log-level"]).toLowerCase();
                const level = LogLevel[levelStr as keyof typeof LogLevel];
                if (level !== undefined) {
                    AppContext.current.logger.setMinLevel(level);
                }
            }

            // Apply detailed-logs if set
            if (settings["detailed-logs"] !== undefined) {
                AppContext.current.logger.setDetailed(Boolean(settings["detailed-logs"]));
            }
        } catch {
            // Silently ignore errors loading settings
        }
    }

    /**
     * Get commands that can be used in TUI.
     * Filters out internal commands like version/help, and adds built-in settings.
     */
    private getExecutableCommands(): AnyCommand[] {
        const userCommands = this.registry
            .list()
            .filter((cmd) => {
                // Exclude internal/built-in commands from the TUI main menu
                if (cmd.tuiHidden) {
                    return false;
                }

                // Extra safety: keep known internal command names out
                if (cmd.name === KNOWN_COMMANDS.help || cmd.name === KNOWN_COMMANDS.version || cmd.name === KNOWN_COMMANDS.settings) {
                    return false;
                }

                return true;
            });

        // Add built-in settings command at the end
        return [...userCommands, createSettingsCommand()];
    }
}
