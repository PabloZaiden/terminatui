import { LogLevel } from "../../core/logger";

// Shared colors for log levels used across debug views.
export const LogColors: Record<LogLevel, string> = {
    [LogLevel.Silly]: "#8c8c8c",
    [LogLevel.Trace]: "#6dd6ff",
    [LogLevel.Debug]: "#7bdcb5",
    [LogLevel.Info]: "#d6dde6",
    [LogLevel.Warn]: "#f5c542",
    [LogLevel.Error]: "#f78888",
    [LogLevel.Fatal]: "#ff5c8d",
};
