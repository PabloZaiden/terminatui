#!/usr/bin/env bun

import { TuiApplication } from "@pablozaiden/terminatui";
import { GreetCommand } from "./commands/greet.ts";

export class MyApp extends TuiApplication {
    static appName = "myapp";

    protected override defaultMode = "opentui" as const;

    constructor() {
        super({
            name: MyApp.appName,
            displayName: "My TUI App",
            version: "0.1.0",
            commands: [new GreetCommand()],
        });
    }
}

await new MyApp().run();
