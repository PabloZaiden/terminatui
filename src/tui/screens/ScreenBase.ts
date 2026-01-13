import type { ScreenComponent } from "../registry";

export abstract class ScreenBase {
    abstract component(): ScreenComponent;
    abstract getRoute(): string;
}
