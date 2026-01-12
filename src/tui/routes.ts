import type { AnyCommand } from "../core/command.ts";
import type { LogEvent } from "../core/logger.ts";
import type { FieldConfig } from "./components/types.ts";

export type Routes = {
    "command-select": {
        commandPath: string[];
        selectedIndex: number;
    };
    config: {
        command: AnyCommand;
        commandPath: string[];
        values: Record<string, unknown>;
        selectedFieldIndex: number;
        fieldConfigs: FieldConfig[];
    };
    running: {
        command: AnyCommand;
        commandPath: string[];
        values: Record<string, unknown>;
    };
    results: {
        command: AnyCommand;
        commandPath: string[];
        values: Record<string, unknown>;
        result: unknown;
    };
    error: {
        command: AnyCommand;
        commandPath: string[];
        values: Record<string, unknown>;
        error: Error;
    };
};

export type Modals = {
    "property-editor": {
        fieldKey: string;
        currentValue: unknown;
        fieldConfigs: FieldConfig[];
        onSubmit: (value: unknown) => void;
        onCancel: () => void;
    };
    "cli-arguments": {
        command: string;
        onCopy?: (content: string, label: string) => void;
        onClose: () => void;
    };
    logs: {
        logs: LogEvent[];
        onCopy?: (content: string, label: string) => void;
        onClose: () => void;
    };
};
