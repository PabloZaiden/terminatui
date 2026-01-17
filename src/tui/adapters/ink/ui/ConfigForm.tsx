import { useRef, useEffect, type ReactNode } from "react";
import { Field } from "../components/Field.tsx";
import { MenuButton } from "../components/MenuButton.tsx";
import { Panel } from "../components/Panel.tsx";
import { ScrollView } from "../components/ScrollView.tsx";
import { Container } from "../components/Container.tsx";
import type { FieldConfig } from "../../../semantic/types.ts";
import type { ScrollViewRef } from "../../../semantic/layoutTypes.ts";

interface ConfigFormProps {
    title: string;
    fieldConfigs: FieldConfig[];
    values: Record<string, unknown>;
    selectedIndex: number;
    focused: boolean;
    getDisplayValue?: (key: string, value: unknown, type: string) => string;
    actionButton: ReactNode;
    additionalButtons?: { label: string; onPress: () => void }[];
}

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

export function ConfigForm({
    title,
    fieldConfigs,
    values,
    selectedIndex,
    focused,
    getDisplayValue = defaultGetDisplayValue,
    actionButton,
    additionalButtons = [],
}: ConfigFormProps) {
    const scrollViewRef = useRef<ScrollViewRef | null>(null);

    useEffect(() => {
        scrollViewRef.current?.scrollToIndex(selectedIndex);
    }, [selectedIndex]);

    return (
        <Panel title={title} focused={focused} flex={1} padding={1} flexDirection="column">
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
                        const displayValue = getDisplayValue(field.key, values[field.key], field.type);

                        return <Field key={field.key} label={field.label} value={displayValue} selected={isSelected} />;
                    })}

                    {additionalButtons.map((btn, idx) => {
                        const buttonSelectedIndex = fieldConfigs.length + idx;
                        return <MenuButton key={btn.label} label={btn.label} selected={selectedIndex === buttonSelectedIndex} />;
                    })}

                    {actionButton}
                </Container>
            </ScrollView>
        </Panel>
    );
}
