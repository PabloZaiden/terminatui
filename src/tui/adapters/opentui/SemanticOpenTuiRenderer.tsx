import type { ReactNode } from "react";
import type { AppShellProps } from "../../semantic/AppShell.tsx";
import type { CommandBrowserScreenProps } from "../../semantic/CommandBrowserScreen.tsx";
import type { ConfigScreenProps } from "../../semantic/ConfigScreen.tsx";
import type { RunningScreenProps } from "../../semantic/RunningScreen.tsx";
import type { LogsScreenProps } from "../../semantic/LogsScreen.tsx";
import type { EditorScreenProps } from "../../semantic/EditorScreen.tsx";
import { Panel } from "../../semantic/Panel.tsx";
import { Container } from "../../semantic/Container.tsx";
import { Header } from "./ui/Header.tsx";
import { CommandSelector } from "./ui/CommandSelector.tsx";
import { ConfigForm } from "./ui/ConfigForm.tsx";
import { ResultsPanel } from "./ui/ResultsPanel.tsx";
import { MenuButton } from "../../semantic/MenuButton.tsx";
import { Overlay } from "../../semantic/Overlay.tsx";
import { Label } from "../../semantic/Label.tsx";
import { Value } from "../../semantic/Value.tsx";
import { TextInput } from "../../semantic/TextInput.tsx";
import { MenuItem } from "../../semantic/MenuItem.tsx";
import { Select } from "../../semantic/Select.tsx";

export class SemanticOpenTuiRenderer {
    renderAppShell(props: AppShellProps & { copyToast: string | null }): ReactNode {
        return (
            <Panel flexDirection="column" flex={1} padding={1} border={false}>
                <Container flexDirection="column" flex={1}>
                    <Header
                        name={props.app.displayName ?? props.app.name}
                        version={props.app.version}
                        breadcrumb={props.app.breadcrumb}
                    />

                    <Container flexDirection="column" flex={1}>
                        {props.screen}
                    </Container>

                    <Panel dense border={true} flexDirection="column" gap={0} height={4}>
                        <Container flexDirection="row" justifyContent="space-between" padding={{ left: 1, right: 1 }}>
                            <Container flexDirection="row" gap={1}>
                                <Label color="mutedText">{props.status.isExecuting ? "Executing..." : "Ready"}</Label>
                                {props.copyToast ? (
                                    <Label color="success" bold>{props.copyToast}</Label>
                                ) : null}
                            </Container>
                            <Label color="mutedText">Esc Back  Ctrl+L Logs  Ctrl+Y Copy</Label>
                        </Container>
                    </Panel>

                    {props.modals}
                </Container>
            </Panel>
        );
    }

    renderCommandBrowserScreen(props: CommandBrowserScreenProps): ReactNode {
        const commandItems = props.commands.map((command) => ({ command }));

        return (
            <CommandSelector
                commands={commandItems}
                selectedIndex={props.selectedCommandIndex}
                onSelect={(command) => {
                    const navigableSubCommands = command.subCommands?.filter((sub) => sub.supportsTui()) ?? [];
                    if (navigableSubCommands.length > 0) {
                        props.onOpenPath([...props.commandId, command.name]);
                        return;
                    }

                    props.onRunSelected();
                }}
                breadcrumb={props.commandId}
            />
        );
    }

    renderConfigScreen(props: ConfigScreenProps): ReactNode {
        const additionalButtons: { label: string; onPress: () => void }[] = [];

        return (
            <Container flexDirection="column" flex={1}>
                <ConfigForm
                    title={props.title}
                    fieldConfigs={props.fieldConfigs}
                    values={props.values}
                    selectedIndex={props.selectedFieldIndex}
                    focused={true}
                    additionalButtons={additionalButtons}
                    actionButton={
                        <MenuButton
                            label={"Run"}
                            selected={props.selectedFieldIndex === props.fieldConfigs.length + additionalButtons.length}
                        />
                    }
                />
            </Container>
        );
    }

    renderRunningScreen(props: RunningScreenProps): ReactNode {
        return (
            <Container flexDirection="column" flex={1}>
                <ResultsPanel result={{ success: true, message: props.title }} error={null} focused={true} />
            </Container>
        );
    }

     renderLogsScreen(props: LogsScreenProps): ReactNode {
         return (
             <Overlay>
                 <Panel flexDirection="column" padding={1} border={true} width={80} surface="overlay">
                     <Label bold>Logs</Label>
                     <Container flexDirection="column" flex={1}>
                         {props.items.slice(-20).map((item) => (
                             <Value key={item.timestamp}>{`[${item.level}] ${item.message}`}</Value>
                         ))}
                     </Container>
                     <Label color="mutedText">Enter or Esc to close</Label>
                 </Panel>
             </Overlay>
         );
     }

    renderEditorScreen(props: EditorScreenProps): ReactNode {
        return (
            <Overlay>
                 <Panel flexDirection="column" padding={1} border={true} width={80} surface="overlay">
                     <Label bold>{props.label ?? props.fieldId}</Label>

                    <Container flexDirection="column" gap={1}>
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

                        {props.cliArguments ? (
                            <MenuItem
                                label="CLI Arguments"
                                description={props.cliArguments.command}
                            />
                        ) : null}
                    </Container>

                    <Label color="mutedText">Enter to submit  Esc to cancel</Label>
                </Panel>
            </Overlay>
        );
    }
}
