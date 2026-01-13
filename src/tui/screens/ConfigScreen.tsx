import { useCallback, useMemo } from "react";
import type { ScreenEntry, NavigationAPI } from "../context/NavigationContext.tsx";
import type { Routes, Modals } from "../routes.ts";
import { ConfigForm } from "../components/ConfigForm.tsx";
import { ActionButton } from "../components/ActionButton.tsx";
import { schemaToFieldConfigs } from "../utils/schemaToFields.ts";
import { useClipboardProvider } from "../hooks/useClipboardProvider.ts";
import { buildCliCommand } from "../utils/buildCliCommand.ts";
import type { OptionSchema, OptionValues } from "../../types/command.ts";

interface ConfigScreenProps {
    entry: ScreenEntry<Routes, "config">;
    navigation: NavigationAPI<Routes, Modals>;
    appName: string;
    onRun: (values: Record<string, unknown>) => void;
    onEditField: (fieldKey: string) => void;
}

export function ConfigScreen({ entry, navigation, appName, onRun, onEditField }: ConfigScreenProps) {
    const { params } = entry;
    if (!params) return null;

    const { command, commandPath, values, selectedFieldIndex } = params;

    const fieldConfigs = useMemo(() => schemaToFieldConfigs(command.options), [command]);

    // Register clipboard provider for this screen
    useClipboardProvider(
        useCallback(() => ({
            content: JSON.stringify(values, null, 2),
            label: "Config",
        }), [values])
    );

    // Handle screen-specific keyboard shortcuts
    const handleKeyDown = useCallback((event: { key: { ctrl?: boolean; name?: string } }) => {
        // Ctrl+A - open CLI modal
        if (event.key.ctrl && event.key.name === "a") {
            const cli = buildCliCommand(appName, commandPath, command.options, values as OptionValues<OptionSchema>);
            navigation.openModal({
                id: "cli-arguments",
                params: { command: cli, onClose: () => navigation.closeModal() },
            });
            return true;
        }
        return false;
    }, [appName, commandPath, command.options, values, navigation]);

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
                onKeyDown={handleKeyDown}
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
