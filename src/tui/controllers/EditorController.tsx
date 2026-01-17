import type { NavigationAPI } from "../context/NavigationContext.tsx";

import { RenderEditorScreen } from "../semantic/render.tsx";

import type { CopyPayload, EditorModalParams } from "../driver/types.ts";

export class EditorController {
    private navigation: NavigationAPI;

    public constructor({ navigation }: { navigation: NavigationAPI }) {
        this.navigation = navigation;
    }

    private getSelectIndexForValue(options: { value: string }[], value: string): number {
        const index = options.findIndex((o) => o.value === value);
        return index >= 0 ? index : 0;
    }

    private updateModalBuffer(params: EditorModalParams, bufferValue: string, selectIndex?: number): void {
        this.navigation.updateModal<EditorModalParams>({
            ...params,
            bufferValue,
            selectIndex,
        });
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

    public getCopyPayload(): CopyPayload | null {
        const params = this.navigation.modalStack[this.navigation.modalStack.length - 1]?.params as
            | EditorModalParams
            | undefined;
        if (!params) {
            return null;
        }

        const activeModalId = this.navigation.modalStack[this.navigation.modalStack.length - 1]?.id;
        if (activeModalId !== "editor") {
            return null;
        }

        const valueString = params.bufferValue ?? String(params.currentValue ?? "");

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
        const bufferString = modalParams.bufferValue;

        const canShowCli = Boolean(modalParams.cliCommand);

        if (fieldConfig?.type === "enum") {
            const options = (fieldConfig.options ?? []).map((o) => ({
                label: String(o.name),
                value: String(o.value),
            }));

            const currentValueString = bufferString ?? String(modalParams.currentValue ?? "");
            const index = modalParams.selectIndex ?? this.getSelectIndexForValue(options, currentValueString);

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
                        const clamped = Math.max(0, Math.min(nextIndex, Math.max(0, options.length - 1)));
                        const next = options[clamped];
                        this.updateModalBuffer(modalParams, next ? next.value : "", clamped);
                    }}
                    onSubmit={() => {
                        const valueString = bufferString ?? String(modalParams.currentValue ?? "");
                        const match = fieldConfig.options?.find((o) => String(o.value) === valueString);
                        modalParams.onSubmit(match?.value ?? valueString);
                    }}
                    onCancel={() => {
                        this.navigation.closeModal();
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
            const index = modalParams.selectIndex ?? (currentBool ? 0 : 1);

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
                        const clamped = Math.max(0, Math.min(nextIndex, 1));
                        this.updateModalBuffer(modalParams, options[clamped]!.value, clamped);
                    }}
                    onSubmit={() => {
                        const normalized = (bufferString ?? String(Boolean(modalParams.currentValue))).trim().toLowerCase();
                        modalParams.onSubmit(normalized === "true");
                    }}
                    onCancel={() => {
                        this.navigation.closeModal();
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
                    this.updateModalBuffer(modalParams, text);
                }}
                onSubmit={() => {
                    const valueString = bufferString ?? String(modalParams.currentValue ?? "");

                    if (!fieldConfig) {
                        modalParams.onSubmit(valueString);
                        return;
                    }

                    const parsed = this.parseValueByFieldType(fieldConfig.type, valueString, modalParams.currentValue);
                    modalParams.onSubmit(parsed);
                }}
                onCancel={() => {
                    this.navigation.closeModal();
                }}
            />
        );
    }
}
