import { useMemo } from "react";
import type { ScreenEntry, NavigationAPI } from "../context/NavigationContext.tsx";
import type { Routes, Modals } from "../routes.ts";
import { ConfigForm } from "../components/ConfigForm.tsx";
import { ActionButton } from "../components/ActionButton.tsx";
import { schemaToFieldConfigs } from "../utils/schemaToFields.ts";

interface ConfigScreenProps {
    entry: ScreenEntry<Routes, "config">;
    navigation: NavigationAPI<Routes, Modals>;
    onRun: (values: Record<string, unknown>) => void;
    onEditField: (fieldKey: string) => void;
}

export function ConfigScreen({ entry, navigation, onRun, onEditField }: ConfigScreenProps) {
    const { params } = entry;
    if (!params) return null;

    const { command, values, selectedFieldIndex } = params;

    const fieldConfigs = useMemo(() => schemaToFieldConfigs(command.options), [command]);


    const handleAction = () => {
        onRun(values);
    };

    return (
        <box flexDirection="column" flexGrow={1}>
            <ConfigForm
                title={`Configure: ${command.displayName ?? command.name}`}
                fieldConfigs={fieldConfigs}
                values={values}
                selectedIndex={selectedFieldIndex}
                focused={true}
                onSelectionChange={(index) =>
                    navigation.replace({ route: "config", params: { ...params, selectedFieldIndex: index } })
                }
                onEditField={onEditField}
                onAction={handleAction}
                actionButton={
                    <ActionButton
                        label={command.actionLabel ?? "Run"}
                        isSelected={selectedFieldIndex === fieldConfigs.length}
                    />
                }
            />
        </box>
    );
}
