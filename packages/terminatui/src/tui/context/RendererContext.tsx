import { createContext, useContext, type ReactNode } from "react";
import type { Renderer } from "../adapters/types.ts";

const RendererContext = createContext<Renderer | null>(null);

export function RendererProvider({ renderer, children }: { renderer: Renderer; children: ReactNode }) {
    return (
        <RendererContext.Provider value={renderer}>
            {children}
        </RendererContext.Provider>
    );
}

export function useRenderer(): Renderer {
    const renderer = useContext(RendererContext);
    if (!renderer) {
        throw new Error("useRenderer must be used within RendererProvider");
    }
    return renderer;
}
