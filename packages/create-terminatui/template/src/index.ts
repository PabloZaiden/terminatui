#!/usr/bin/env bun

import { TuiApplication } from "@pablozaiden/terminatui";
import { GreetCommand } from "./commands/greet.ts";

class MyApp extends TuiApplication {
    protected override defaultMode = "opentui" as const;

    constructor() {
        super({
            name: "myapp",
            displayName: "My TUI App",
            version: "0.1.0",
            commands: [new GreetCommand()],
        });
    }
}

await new MyApp().run();
