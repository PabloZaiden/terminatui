/**
 * Default TUI theme.
 *
 * This is intentionally semantic: UI code should reference meanings
 * (e.g. "error", "mutedText", "selectionBackground") rather than hardcoding colors.
 */
const semanticColors = {
    background: "#0b0c10",
    panelBackground: "#0b0c10",

    text: "#d6dde6",
    mutedText: "#a8b3c1",
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

/**
 * Backwards-compatible theme export.
 *
 * Existing code reads flat properties (e.g. `Theme.borderFocused`).
 * New semantic components should prefer `Theme.colors.*`.
 */
export const Theme = {
    // New semantic shape
    colors: semanticColors,

    // Legacy flat shape
    background: semanticColors.background,
    border: semanticColors.border,
    borderFocused: semanticColors.focusBorder,
    borderSelected: semanticColors.primary,
    label: semanticColors.mutedText,
    value: semanticColors.value,
    actionButton: semanticColors.primary,
    header: semanticColors.mutedText,
    statusText: semanticColors.text,
    overlay: semanticColors.panelBackground,
    overlayTitle: semanticColors.warning,
    error: semanticColors.error,
    success: semanticColors.success,
    warning: semanticColors.warning,
} as const;

export type ThemeConfig = typeof Theme;
export type ThemeColors = typeof semanticColors;
