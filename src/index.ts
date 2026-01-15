export * from "./builtins/help.ts";
export * from "./builtins/settings.ts";
export * from "./builtins/version.ts";

export * from "./cli/parser.ts";
export * from "./cli/output/colors.ts";

export * from "./core/application.ts";
export * from "./core/command.ts";
export * from "./core/context.ts";
export * from "./core/help.ts";
export * from "./core/knownCommands.ts";
export * from "./core/logger.ts";
export * from "./core/registry.ts";

export * from "./tui/TuiApplication.tsx";
export * from "./tui/TuiRoot.tsx";
export * from "./tui/registry.ts";
export * from "./tui/theme.ts";
export * from "./types/command.ts";
// Note: `src/types/execution.ts` exports `ExecutionMode`, but `ExecutionOutcome` lives in `ExecutorContext`.
// Root exports prefer `ExecutionOutcome` from the context.
