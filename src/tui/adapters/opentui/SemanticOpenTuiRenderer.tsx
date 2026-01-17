import type { ReactNode } from "react";
import type { AppShellProps } from "../../semantic/AppShell.tsx";
import type { CommandBrowserScreenProps } from "../../semantic/CommandBrowserScreen.tsx";
import type { ConfigScreenProps } from "../../semantic/ConfigScreen.tsx";
import type { RunningScreenProps } from "../../semantic/RunningScreen.tsx";
import type { LogsScreenProps } from "../../semantic/LogsScreen.tsx";
import type { EditorScreenProps } from "../../semantic/EditorScreen.tsx";

// Platform-native components (OpenTUI)
import { Panel } from "./components/Panel.tsx";
import { Label } from "./components/Label.tsx";
import { Overlay } from "./components/Overlay.tsx";
import { TextInput } from "./components/TextInput.tsx";
import { Select } from "./components/Select.tsx";
import { MenuButton } from "./components/MenuButton.tsx";
import { Spinner } from "./components/Spinner.tsx";

// Adapter-local UI components
import { Header } from "./ui/Header.tsx";
import { CommandSelector } from "./ui/CommandSelector.tsx";
import { ConfigForm } from "./ui/ConfigForm.tsx";
import { ResultsPanel } from "./ui/ResultsPanel.tsx";
import { LogsPanel } from "./ui/LogsPanel.tsx";

export class SemanticOpenTuiRenderer {
    renderAppShell(props: AppShellProps): ReactNode {
        return (
            <Panel flexDirection="column" flex={1} padding={1} border={false}>
                <box flexDirection="column" flexGrow={1}>
                    <Header
                        name={props.app.displayName ?? props.app.name}
                        version={props.app.version}
                        breadcrumb={props.app.breadcrumb}
                    />

                    <box flexDirection="column" flexGrow={1}>
                        {props.screen}
                    </box>

                    <Panel dense border={true} flexDirection="column" gap={0} height={4}>
                        <box flexDirection="row" justifyContent="space-between" paddingLeft={1} paddingRight={1}>
                            <box flexDirection="row" gap={1}>
                                <Spinner active={props.status.isExecuting} />
                                <Label color="mutedText">
                                    {props.status.isCancelling
                                        ? "Cancelling..."
                                        : props.status.isExecuting
                                          ? "Executing..."
                                          : "Ready"}
                                </Label>
                                {props.copyToast ? (
                                    <Label color="success" bold>{props.copyToast}</Label>
                                ) : null}
                            </box>
                            <Label color="mutedText">Esc Back  Ctrl+L Logs  Ctrl+Y Copy</Label>
                        </box>
                    </Panel>

                    {props.modals}
                </box>
            </Panel>
        );
    }

    renderCommandBrowserScreen(props: CommandBrowserScreenProps): ReactNode {
        const commandItems = props.commands.map((command) => ({ command }));

        return (
            <CommandSelector
                commands={commandItems}
                selectedIndex={props.selectedCommandIndex}
                onSelect={() => {
                    // Controller handles subcommand navigation in onRunSelected
                    props.onRunSelected();
                }}
                breadcrumb={props.commandId}
            />
        );
    }

    renderConfigScreen(props: ConfigScreenProps): ReactNode {
        const additionalButtons: { label: string; onPress: () => void }[] = [];

        return (
            <box flexDirection="column" flexGrow={1}>
                <ConfigForm
                    title={props.title}
                    fieldConfigs={props.fieldConfigs}
                    values={props.values}
                    selectedIndex={props.selectedFieldIndex}
                    focused={true}
                    additionalButtons={additionalButtons}
                    actionButton={
                        <MenuButton
                            label={"Done"}
                            selected={props.selectedFieldIndex === props.fieldConfigs.length + additionalButtons.length}
                        />
                    }
                />
                <box flexDirection="column" paddingTop={1}>
                    <Label color="mutedText">CLI: {props.cliCommand}</Label>
                </box>
            </box>
        );
    }

    renderRunningScreen(props: RunningScreenProps): ReactNode {
        if (props.kind === "running") {
            return (
                <box flexDirection="column" flexGrow={1}>
                    <ResultsPanel result={{ success: true, message: props.title }} error={null} focused={true} />
                </box>
            );
        }

        if (props.kind === "error") {
            return (
                <box flexDirection="column" flexGrow={1}>
                    <ResultsPanel result={null} error={new Error(props.message ?? "Unknown error")} focused={true} />
                </box>
            );
        }

        // kind === "results"
        // If customContent is provided, render it directly instead of using ResultsPanel's default rendering
        if (props.customContent !== undefined) {
            return (
                <box flexDirection="column" flexGrow={1}>
                    <ResultsPanel
                        result={props.result ?? { success: true, message: props.message }}
                        error={null}
                        focused={true}
                        renderResult={() => props.customContent}
                    />
                </box>
            );
        }

        return (
            <box flexDirection="column" flexGrow={1}>
                <ResultsPanel 
                    result={props.result ?? { success: true, message: props.message }} 
                    error={null} 
                    focused={true} 
                />
            </box>
        );
    }

     renderLogsScreen(props: LogsScreenProps): ReactNode {
         return <LogsPanel {...props} />;
     }

    renderEditorScreen(props: EditorScreenProps): ReactNode {
        // For text input, use more height to give a proper editing area
        const isTextEditor = props.editorType !== "select";
        const panelHeight = isTextEditor ? 8 : undefined;

        return (
            <Overlay>
                 <Panel flexDirection="column" padding={1} border={true} width={80} height={panelHeight} surface="overlay">
                     <Label bold>{props.label ?? props.fieldId}</Label>

                    <box flexDirection="column" gap={1} flexGrow={1}>
                        {props.editorType === "select" ? (
                            <Select
                                options={props.selectOptions ?? []}
                                value={props.valueString}
                                focused={true}
                                onChange={(value: string) => {
                                    const index = (props.selectOptions ?? []).findIndex((o) => o.value === value);
                                    props.onChangeSelectIndex?.(Math.max(0, index));
                                }}
                                onSubmit={() => props.onSubmit?.()}
                            />
                        ) : (
                            <TextInput
                                value={props.valueString}
                                placeholder=""
                                focused={true}
                                onChange={(next: string) => props.onChangeText?.(next)}
                                onSubmit={() => props.onSubmit?.()}
                            />
                        )}
                    </box>

                    <Label color="mutedText">Enter to submit  Esc to cancel</Label>
                </Panel>
            </Overlay>
        );
    }
}
