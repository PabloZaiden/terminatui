/**
 * Default TUI theme.
 *
 * This is intentionally semantic: UI code should reference meanings
 * (e.g. "error", "mutedText", "selectionBackground") rather than hardcoding colors.
 */
export const SemanticColors = {
    background: "#0f1117",
    panelBackground: "#0f1117",
    overlay: "#101218",

    text: "#d6dde6",
    mutedText: "#666666",
    inverseText: "#0b0c10",
    
    border: "#2c2f36",
    focusBorder: "#5da9e9",

    primary: "#61afef",
    primaryText: "#0b0c10",

    success: "#98c379",
    warning: "#f5c542",
    error: "#f78888",

    value: "#98c379",
    code: "#c0cad6",

    selectionBackground: "#61afef",
    selectionText: "#0b0c10",
} as const;

