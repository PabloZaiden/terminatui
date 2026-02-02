#!/usr/bin/env bun
/**
 * Example TUI Application
 * 
 * Demonstrates how to use TuiApplication to build a CLI/TUI app
 * with minimal effort. Just run:
 * 
 *   bun examples/tui-app/index.ts
 * 
 * Or in CLI mode:
 * 
 *   bun examples/tui-app/index.ts greet --name "World" --loud
 */

import { TuiApplication } from "@pablozaiden/terminatui";
import { ConfigCommand } from "./commands/config/index.ts";
import { DummyCommand } from "./commands/dummy.ts";
import { GreetCommand } from "./commands/greet.ts";
import { MathCommand } from "./commands/math.ts";
import { StatusCommand } from "./commands/status.ts";

class ExampleApp extends TuiApplication {
    constructor() {
        // Pass commands in the constructor for simple cases.
        // For dynamic registration (e.g., after async initialization),
        // omit `commands` here and call `this.registerCommands([...])` later.
        super({
            name: "example",
            version: "1.0.0",
            commands: [
                new GreetCommand(),
                new MathCommand(),
                new StatusCommand(),
                new ConfigCommand(),
                new DummyCommand(),
            ],
        });
    }
}

// Run the app
await new ExampleApp().run();
