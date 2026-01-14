import type { Renderer, RendererConfig, RendererType } from "./types.ts";
import { OpenTuiRenderer } from "./opentui/OpenTuiRenderer.tsx";

export async function createRenderer(type: RendererType, config: RendererConfig): Promise<Renderer> {
    switch (type) {
        case "opentui": {
            const renderer = new OpenTuiRenderer(config);
            await renderer.initialize();
            return renderer;
        }
        case "ink": {
            throw new Error("Ink renderer not implemented yet");
        }
    }
}
