import { LogLevel } from "../../core/logger";

// Shared colors for log levels used across debug views.
export const LogColors: Record<LogLevel, string> = {
    [LogLevel.silly]: "#8c8c8c",
    [LogLevel.trace]: "#6dd6ff",
    [LogLevel.debug]: "#7bdcb5",
    [LogLevel.info]: "#d6dde6",
    [LogLevel.warn]: "#f5c542",
    [LogLevel.error]: "#f78888",
    [LogLevel.fatal]: "#ff5c8d",
};
