import { useRef, useEffect, type ReactNode } from "react";
import { Field } from "../semantic/Field.tsx";
import { MenuButton } from "../semantic/MenuButton.tsx";
import { Panel } from "../semantic/Panel.tsx";
import { ScrollView, type ScrollViewRef } from "../semantic/ScrollView.tsx";
import { Container } from "../semantic/Container.tsx";
import { useActiveKeyHandler } from "../hooks/useActiveKeyHandler.ts";
import type { KeyboardEvent } from "../adapters/types.ts";
import type { FieldConfig } from "./types.ts";

interface ConfigFormProps {
    /** Title for the form border */
    title: string;
    /** Field configurations */
    fieldConfigs: FieldConfig[];
    /** Current values */
    values: Record<string, unknown>;
    /** Currently selected index */
    selectedIndex: number;
    /** Whether the form is focused */
    focused: boolean;
    /** Called when selection changes */
    onSelectionChange: (index: number) => void;
    /** Called when a field should be edited */
    onEditField: (fieldKey: string) => void;
    /** Called when the action button is pressed */
    onAction: () => void;
    /** Function to get display value for a field */
    getDisplayValue?: (key: string, value: unknown, type: string) => string;
    /** The action button component */
    actionButton: ReactNode;
    /** Optional additional buttons rendered before the main action button */
    additionalButtons?: { label: string; onPress: () => void }[];
    /** Optional handler for additional keys (called before default handling) */
    onKeyDown?: (event: KeyboardEvent) => boolean;
}

/**
 * Default display value formatter.
 */
function defaultGetDisplayValue(_key: string, value: unknown, type: string): string {
    if (type === "boolean") {
        return value ? "True" : "False";
    }
    const strValue = String(value ?? "");
    if (strValue === "") {
        return "(empty)";
    }
    return strValue.length > 60 ? strValue.substring(0, 57) + "..." : strValue;
}

/**
 * Generic config form that renders fields from a schema.
 */
export function ConfigForm({
    title,
    fieldConfigs,
    values,
    selectedIndex,
    focused,
    onSelectionChange,
    onEditField,
    onAction,
    getDisplayValue = defaultGetDisplayValue,
    actionButton,
    additionalButtons = [],
    onKeyDown,
}: ConfigFormProps) {
    const scrollViewRef = useRef<ScrollViewRef | null>(null);
    const totalItems = fieldConfigs.length + additionalButtons.length + 1; // fields + additional buttons + action button

    // Auto-scroll to keep selected item visible
    useEffect(() => {
        scrollViewRef.current?.scrollToIndex(selectedIndex);
    }, [selectedIndex]);

    // Handle keyboard events (only when focused)
    useActiveKeyHandler(
        (event: KeyboardEvent) => {
            // Let parent handle first if provided
            if (onKeyDown?.(event)) {
                return true;
            }

            const key = event;

            // Arrow key navigation
            if (key.name === "down") {
                const newIndex = Math.min(selectedIndex + 1, totalItems - 1);
                onSelectionChange(newIndex);
                return true;
            }

            if (key.name === "up") {
                const newIndex = Math.max(selectedIndex - 1, 0);
                onSelectionChange(newIndex);
                return true;
            }

            // Enter to edit field, press additional button, or run action
            if (key.name === "return" || key.name === "enter") {
                if (selectedIndex < fieldConfigs.length) {
                    // It's a field
                    const fieldConfig = fieldConfigs[selectedIndex];
                    if (fieldConfig) {
                        onEditField(fieldConfig.key);
                    }
                } else if (selectedIndex < fieldConfigs.length + additionalButtons.length) {
                    // It's an additional button
                    const buttonIndex = selectedIndex - fieldConfigs.length;
                    additionalButtons[buttonIndex]?.onPress();
                } else {
                    // It's the main action button
                    onAction();
                }
                return true;
            }

            return false;
        },
        { enabled: focused }
    );

    return (
        <Panel
            title={title}
            focused={focused}
            flex={1}
            padding={1}
            flexDirection="column"
        >
            <ScrollView
                axis="vertical"
                flex={1}
                scrollRef={(ref) => {
                    scrollViewRef.current = ref;
                }}
            >
                <Container flexDirection="column" gap={0}>
                    {fieldConfigs.map((field, idx) => {
                        const isSelected = idx === selectedIndex;
                        const displayValue = getDisplayValue(
                            field.key,
                            values[field.key],
                            field.type
                        );

                        return (
                            <Field
                                key={field.key}
                                label={field.label}
                                value={displayValue}
                                selected={isSelected}
                            />
                        );
                    })}

                    {additionalButtons.map((btn, idx) => {
                        const buttonSelectedIndex = fieldConfigs.length + idx;
                        return (
                            <MenuButton
                                key={btn.label}
                                label={btn.label}
                                selected={selectedIndex === buttonSelectedIndex}
                            />
                        );
                    })}

                    {actionButton}
                </Container>
            </ScrollView>
        </Panel>
    );
}
