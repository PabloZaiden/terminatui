#!/usr/bin/env bun

import { TuiApplication } from "@pablozaiden/terminatui";
import { GreetCommand } from "./commands/greet.ts";

export class MyApp extends TuiApplication {
    static appName = "myapp";

    protected override defaultMode = "opentui" as const;

    constructor() {
        // Pass commands in the constructor for simple cases.
        // For dynamic registration (e.g., after async initialization),
        // omit `commands` here and call `this.registerCommands([...])` later.
        super({
            name: MyApp.appName,
            displayName: "My TUI App",
            version: "0.1.0",
            commands: [new GreetCommand()],
        });
    }
}

await new MyApp().run();
