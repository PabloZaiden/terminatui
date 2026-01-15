import type { Renderer, RendererConfig } from "./types.ts";
import { OpenTuiRenderer } from "./opentui/OpenTuiRenderer.tsx";
import { InkRenderer } from "./ink/InkRenderer.tsx";
import type { TuiModeOptions } from "../../core/application.ts";

export async function createRenderer(type: TuiModeOptions, config: RendererConfig): Promise<Renderer> {
    switch (type) {
        case "opentui": {
            const renderer = new OpenTuiRenderer(config);
            await renderer.initialize();
            return renderer;
        }
        case "ink": {
            const renderer = new InkRenderer(config);
            await renderer.initialize();
            return renderer;
        }
    }
}
