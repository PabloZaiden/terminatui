import type { AnyCommand } from "../../core/command.ts";
import type { OptionSchema } from "../../types/command.ts";
import type { schemaToFieldConfigs } from "../utils/schemaToFields.ts";

export type TuiRoute = "commandBrowser" | "config" | "running" | "results" | "error";

export type TuiModalId = "logs" | "editor";

export type EditorModalParams = {
    fieldKey: string;
    currentValue: unknown;
    fieldConfigs: ReturnType<typeof schemaToFieldConfigs>;
    cliCommand?: string;
    onSubmit: (value: unknown) => void;
    onCancel: () => void;
};

export type ConfigRouteParams = {
    command: AnyCommand;
    commandPath: string[];
    values: Record<string, unknown>;
    fieldConfigs: ReturnType<typeof schemaToFieldConfigs>;
};

export type CommandBrowserRouteParams = {
    commandPath: string[];
};

export type RunningRouteParams = {
    command: AnyCommand;
    commandPath: string[];
    values: Record<string, unknown>;
};

export type ResultsRouteParams = {
    command: AnyCommand;
    commandPath: string[];
    values: Record<string, unknown>;
    result: unknown;
};

export type ErrorRouteParams = {
    command: AnyCommand;
    commandPath: string[];
    values: Record<string, unknown>;
    error: Error;
};

export type RouteParamsById = {
    commandBrowser: CommandBrowserRouteParams;
    config: ConfigRouteParams;
    running: RunningRouteParams;
    results: ResultsRouteParams;
    error: ErrorRouteParams;
};

export type TuiScreenEntry = {
    [K in TuiRoute]: { route: K; params: RouteParamsById[K] };
}[TuiRoute];

export type CopyPayload = {
    label: string;
    content: string;
};

export type CommandConfigDefaultsResolver = (schema: OptionSchema) => Record<string, unknown>;
