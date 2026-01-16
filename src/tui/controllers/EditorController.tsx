import type { NavigationAPI } from "../context/NavigationContext.tsx";

import { RenderEditorScreen } from "../semantic/render.tsx";

import type { CopyPayload, EditorModalParams } from "../driver/types.ts";

type EditorBufferState =
    | {
          fieldKey: string;
          valueString: string;
      }
    | null;

export class EditorController {
    #navigation: NavigationAPI;
    #editorBuffer: EditorBufferState = null;

    private getSelectIndexForValue(options: { value: string }[], value: string): number {
        const index = options.findIndex((o) => o.value === value);
        return index >= 0 ? index : 0;
    }

    private setSelectBuffer(
        fieldKey: string,
        options: { value: string }[],
        nextIndex: number
    ): void {
        const clamped = Math.max(0, Math.min(nextIndex, Math.max(0, options.length - 1)));
        const next = options[clamped];
        this.#editorBuffer = {
            fieldKey,
            valueString: next ? next.value : "",
        };
    }

    private parseValueByFieldType(type: string, valueString: string, fallback: unknown): unknown {
        if (type === "number") {
            const num = Number(valueString);
            return Number.isFinite(num) ? num : fallback;
        }

        if (type === "boolean") {
            const normalized = valueString.trim().toLowerCase();
            if (normalized === "true") return true;
            if (normalized === "false") return false;
            return fallback;
        }

        return valueString;
    }

    public constructor({ navigation }: { navigation: NavigationAPI }) {
        this.#navigation = navigation;
    }

    public getCopyPayload(): CopyPayload | null {
        const params = this.#navigation.modalStack[this.#navigation.modalStack.length - 1]?.params as
            | EditorModalParams
            | undefined;
        if (!params) {
            return null;
        }

        const activeModalId = this.#navigation.modalStack[this.#navigation.modalStack.length - 1]?.id;
        if (activeModalId !== "editor") {
            return null;
        }

        const valueString =
            this.#editorBuffer?.fieldKey === params.fieldKey
                ? this.#editorBuffer.valueString
                : String(params.currentValue ?? "");

        return {
            label: `Field: ${params.fieldKey}`,
            content: valueString,
        };
    }

    public render(modalParams: EditorModalParams | undefined): React.ReactNode {
        if (!modalParams) {
            return null;
        }

        const fieldConfig = modalParams.fieldConfigs.find((f) => f.key === modalParams.fieldKey);
        const bufferString =
            this.#editorBuffer?.fieldKey === modalParams.fieldKey ? this.#editorBuffer.valueString : undefined;

        const canShowCli = Boolean(modalParams.cliCommand);

        if (fieldConfig?.type === "enum") {
            const options = (fieldConfig.options ?? []).map((o) => ({
                label: String(o.name),
                value: String(o.value),
            }));

            const currentValueString = bufferString ?? String(modalParams.currentValue ?? "");
            const index = this.getSelectIndexForValue(options, currentValueString);

            return (
                <RenderEditorScreen
                    key="modal-editor"
                    fieldId={modalParams.fieldKey}
                    label={modalParams.fieldKey}
                    valueString={options[index]?.value ?? currentValueString}
                    editorType="select"
                    selectOptions={options}
                    selectIndex={index}
                    cliArguments={canShowCli ? { command: modalParams.cliCommand! } : undefined}
                    onChangeSelectIndex={(nextIndex) => {
                        this.setSelectBuffer(modalParams.fieldKey, options, nextIndex);
                    }}
                    onSubmit={() => {
                        const valueString =
                            this.#editorBuffer?.fieldKey === modalParams.fieldKey
                                ? this.#editorBuffer.valueString
                                : String(modalParams.currentValue ?? "");

                        const match = fieldConfig.options?.find((o) => String(o.value) === valueString);
                        modalParams.onSubmit(match?.value ?? valueString);
                        this.#editorBuffer = null;
                    }}
                    onCancel={() => {
                        this.#navigation.closeModal();
                        this.#editorBuffer = null;
                    }}
                />
            );
        }

        if (fieldConfig?.type === "boolean") {
            const options = [
                { label: "true", value: "true" },
                { label: "false", value: "false" },
            ];

            const currentBool =
                bufferString !== undefined ? bufferString.trim().toLowerCase() === "true" : Boolean(modalParams.currentValue);
            const index = currentBool ? 0 : 1;

            return (
                <RenderEditorScreen
                    key="modal-editor"
                    fieldId={modalParams.fieldKey}
                    label={modalParams.fieldKey}
                    valueString={options[index]!.value}
                    editorType="select"
                    selectOptions={options}
                    selectIndex={index}
                    cliArguments={canShowCli ? { command: modalParams.cliCommand! } : undefined}
                    onChangeSelectIndex={(nextIndex) => {
                        this.setSelectBuffer(modalParams.fieldKey, options, nextIndex);
                    }}
                    onSubmit={() => {
                        const normalized = (bufferString ?? String(Boolean(modalParams.currentValue))).trim().toLowerCase();
                        modalParams.onSubmit(normalized === "true");
                        this.#editorBuffer = null;
                    }}
                    onCancel={() => {
                        this.#navigation.closeModal();
                        this.#editorBuffer = null;
                    }}
                />
            );
        }


        return (
            <RenderEditorScreen
                key="modal-editor"
                fieldId={modalParams.fieldKey}
                label={modalParams.fieldKey}
                valueString={bufferString ?? String(modalParams.currentValue ?? "")}
                editorType={fieldConfig?.type === "number" ? "number" : "text"}
                     cliArguments={canShowCli ? { command: modalParams.cliCommand! } : undefined}

                onChangeText={(text) => {
                    this.#editorBuffer = { fieldKey: modalParams.fieldKey, valueString: text };
                }}
                onSubmit={() => {
                    const valueString =
                        this.#editorBuffer?.fieldKey === modalParams.fieldKey
                            ? this.#editorBuffer.valueString
                            : String(modalParams.currentValue ?? "");

                    if (!fieldConfig) {
                        modalParams.onSubmit(valueString);
                        this.#editorBuffer = null;
                        return;
                    }

                    const parsed = this.parseValueByFieldType(fieldConfig.type, valueString, modalParams.currentValue);
                    modalParams.onSubmit(parsed);
                    this.#editorBuffer = null;
                }}
                onCancel={() => {
                    this.#navigation.closeModal();
                    this.#editorBuffer = null;
                }}
            />
        );
    }
}
