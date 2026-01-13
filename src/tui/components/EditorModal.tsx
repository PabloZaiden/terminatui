import { useState, useEffect } from "react";
import { Theme } from "../theme.ts";
import type { FieldConfig } from "./types.ts";
import { ModalBase } from "./ModalBase.tsx";
import { useActiveKeyHandler } from "../hooks/useActiveKeyHandler.ts";
import { Select } from "../semantic/Select.tsx";
import { TextInput } from "../semantic/TextInput.tsx";

export interface EditorModalParams {
    fieldKey: string;
    currentValue: unknown;
    fieldConfigs: FieldConfig[];
    onSubmit: (value: unknown) => void;
    onCancel: () => void;
}

interface EditorModalProps {
    /** Whether the modal is visible */
    visible: boolean;
}

/**
 * Modal for editing field values.
 * Supports text, number, enum, and boolean types.
 * 
 * Note: This modal uses native OpenTUI input/select components that handle
 * keyboard events internally. The modal registers as the active handler to
 * block the underlying screen from receiving events, even though most key
 * handling is done by the native components.
 */
export function EditorModal({
    fieldKey,
    currentValue,
    visible,
    onSubmit,
    fieldConfigs,
}: EditorModalParams & EditorModalProps) {
    const [inputValue, setInputValue] = useState("");
    const [selectIndex, setSelectIndex] = useState(0);

    // Reset state when field changes
    useEffect(() => {
        if (fieldKey && visible) {
            setInputValue(String(currentValue ?? ""));

            // For enums/booleans, find current index
            const fieldConfig = fieldConfigs.find((f) => f.key === fieldKey);
            if (fieldConfig?.type === "boolean") {
                setSelectIndex(currentValue ? 1 : 0);
            } else if (fieldConfig?.options) {
                const idx = fieldConfig.options.findIndex((o) => o.value === currentValue);
                setSelectIndex(idx >= 0 ? idx : 0);
            }
        }
    }, [fieldKey, currentValue, visible, fieldConfigs]);

    // Register as active handler to block underlying screen from receiving events.
    // The native input/select components handle Enter internally via onSubmit/onSelect,
    // so we don't need to handle it here. We just need to be the active handler.
    useActiveKeyHandler(
        () => {
            // Let native components handle everything - we're just blocking the screen below
            return false;
        },
        { enabled: visible && fieldKey !== null }
    );

    if (!visible || !fieldKey) {
        return null;
    }

    const fieldConfig = fieldConfigs.find((f) => f.key === fieldKey);
    if (!fieldConfig) {
        return null;
    }

    const isNumber = fieldConfig.type === "number";

    const handleInputSubmit = (value: string) => {
        if (isNumber) {
            onSubmit(parseInt(value.replace(/[^0-9-]/g, ""), 10) || 0);
        } else {
            onSubmit(value);
        }
    };

    const selectOptions =
        fieldConfig.type === "boolean"
            ? [
                  { label: "False", value: "false" },
                  { label: "True", value: "true" },
              ]
            : fieldConfig.type === "enum"
              ? (fieldConfig.options ?? []).map((o) => ({
                    label: o.name,
                    value: String(o.value),
                }))
              : null;

    const usesSelect = selectOptions !== null;

    const handleSelectSubmit = () => {
        const selected = selectOptions?.[selectIndex];
        if (!selected) {
            return;
        }

        if (fieldConfig.type === "boolean") {
            onSubmit(selected.value === "true");
            return;
        }

        onSubmit(selected.value);
    };

    return (
        <ModalBase title={`Edit: ${fieldConfig.label}`} width="60%" height={12} top={4} left={6}>
            {usesSelect && selectOptions && (
                <Select
                    options={selectOptions}
                    value={selectOptions[selectIndex]?.value ?? selectOptions[0]?.value ?? ""}
                    focused={true}
                    onChange={(next) => {
                        const idx = selectOptions.findIndex((o) => o.value === next);
                        setSelectIndex(idx >= 0 ? idx : 0);
                    }}
                    onSubmit={handleSelectSubmit}
                />
            )}

            {!usesSelect && (
                <TextInput
                    value={inputValue}
                    placeholder={fieldConfig.placeholder ?? `Enter ${fieldConfig.label.toLowerCase()}...`}
                    focused={true}
                    onChange={(value) => setInputValue(value)}
                    onSubmit={() => handleInputSubmit(inputValue)}
                />
            )}

            <text fg={Theme.statusText}>
                Enter to save, Esc to cancel
            </text>
        </ModalBase>
    );
}
