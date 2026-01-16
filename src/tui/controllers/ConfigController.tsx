import type { AnyCommand } from "../../core/command.ts";
import type { NavigationAPI } from "../context/NavigationContext.tsx";
import type { ExecutorContextValue } from "../context/ExecutorContext.tsx";

import { RenderConfigScreen } from "../semantic/render.tsx";

import { buildCliCommand } from "../utils/buildCliCommand.ts";
import { schemaToFieldConfigs } from "../utils/schemaToFields.ts";
import { loadPersistedParameters, savePersistedParameters } from "../utils/parameterPersistence.ts";

import type { OptionDef, OptionSchema } from "../../types/command.ts";
import type { EditorModalParams, TuiRoute } from "../driver/types.ts";

export class ConfigController {
    public getCopyPayload(params: {
        command: AnyCommand;
        commandPath: string[];
        values: Record<string, unknown>;
    }): { label: string; content: string } {
        const schema = params.command.options as OptionSchema;
        const cli = buildCliCommand(this.#appName, params.commandPath, schema, params.values as any);
        return { label: "CLI", content: cli };
    }

    #appName: string;
    #navigation: NavigationAPI;
    #executor: ExecutorContextValue;

    #configSelectedFieldIndex = 0;

    public constructor({
        appName,
        navigation,
        executor,
    }: {
        appName: string;
        navigation: NavigationAPI;
        executor: ExecutorContextValue;
    }) {
        this.#appName = appName;
        this.#navigation = navigation;
        this.#executor = executor;
    }

    public render(): { node: React.ReactNode; breadcrumb?: string[] } {
        const params = this.#navigation.current.params as
            | {
                  command: AnyCommand;
                  commandPath: string[];
                  values: Record<string, unknown>;
                  fieldConfigs: ReturnType<typeof schemaToFieldConfigs>;
              }
            | undefined;

        if (!params) {
            return { node: null };
        }

        const title = `Configure: ${params.command.displayName ?? params.command.name}`;

        return {
            breadcrumb: params.commandPath,
            node: (
                <RenderConfigScreen
                    title={title}
                    commandId={params.commandPath}
                    fieldConfigs={params.fieldConfigs}
                    values={params.values}
                    selectedFieldIndex={Math.min(
                        this.#configSelectedFieldIndex,
                        Math.max(0, params.fieldConfigs.length)
                    )}
                    onSelectionChange={(index) => {
                        const maxIndex = params.fieldConfigs.length;
                        const nextIndex = Math.max(0, Math.min(index, maxIndex));
                        this.#configSelectedFieldIndex = nextIndex;
                    }}
                    onEditField={(fieldId) => {
                        const fieldValue = params.values[fieldId];

                        const schema = params.command.options as OptionSchema;
                        const cli = buildCliCommand(this.#appName, params.commandPath, schema, params.values as any);

                        this.#navigation.openModal<EditorModalParams>("editor", {
                            fieldKey: fieldId,
                            currentValue: fieldValue,
                            fieldConfigs: params.fieldConfigs,
                             cliCommand: cli,

                            onSubmit: (value: unknown) => {
                                this.#navigation.replace("config" satisfies TuiRoute, {
                                    ...params,
                                    values: { ...params.values, [fieldId]: value },
                                });
                                this.#navigation.closeModal();
                            },
                            onCancel: () => {
                                this.#navigation.closeModal();
                            },
                        });
                    }}
                    onRun={() => {
                        void (async () => {
                            savePersistedParameters(this.#appName, params.command.name, params.values);
                            this.#navigation.push("running" satisfies TuiRoute, {
                                command: params.command,
                                commandPath: params.commandPath,
                                values: params.values,
                            });

                            const outcome = await this.#executor.execute(params.command, params.values);
                            if (outcome.cancelled) {
                                this.#navigation.pop();
                                return;
                            }

                            if (outcome.success) {
                                this.#navigation.replace("results" satisfies TuiRoute, {
                                    command: params.command,
                                    commandPath: params.commandPath,
                                    values: params.values,
                                    result: outcome.result ?? null,
                                });
                            } else {
                                this.#navigation.replace("error" satisfies TuiRoute, {
                                    command: params.command,
                                    commandPath: params.commandPath,
                                    values: params.values,
                                    error: outcome.error ?? new Error("Unknown error"),
                                });
                            }
                        })();
                    }}
                />
            ),
        };
    }

    public initializeValues(cmd: AnyCommand): Record<string, unknown> {
        const defaults: Record<string, unknown> = {};
        const optionDefs = cmd.options as OptionSchema;

        for (const [key, def] of Object.entries(optionDefs)) {
            const typedDef = def as OptionDef;
            if (typedDef.default !== undefined) {
                defaults[key] = typedDef.default;
            } else {
                switch (typedDef.type) {
                    case "string":
                        defaults[key] = typedDef.enum?.[0] ?? "";
                        break;
                    case "number":
                        defaults[key] = typedDef.min ?? 0;
                        break;
                    case "boolean":
                        defaults[key] = false;
                        break;
                    case "array":
                        defaults[key] = [];
                        break;
                }
            }
        }

        const persisted = loadPersistedParameters(this.#appName, cmd.name);
        return { ...defaults, ...persisted };
    }
}
