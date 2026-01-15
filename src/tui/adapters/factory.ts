import type { Renderer, RendererConfig, RendererType } from "./types.ts";
import { OpenTuiRenderer } from "./opentui/OpenTuiRenderer.tsx";
import { InkRenderer } from "./ink/InkRenderer.tsx";

export async function createRenderer(type: RendererType, config: RendererConfig): Promise<Renderer> {
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
