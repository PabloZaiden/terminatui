import type { Command } from "../../../../core/command.ts";
import { MenuItem } from "../components/MenuItem.tsx";
import { Container } from "../components/Container.tsx";
import { Panel } from "../components/Panel.tsx";

interface CommandItem {
    command: Command;
    label?: string;
    description?: string;
}

interface CommandSelectorProps {
    commands: CommandItem[];
    selectedIndex: number;
    onSelect: (command: Command) => void;
    breadcrumb?: string[];
}

export function CommandSelector({ commands, selectedIndex, onSelect, breadcrumb }: CommandSelectorProps) {
    const title = breadcrumb?.length ? `Select Command (${breadcrumb.join(" 3 ")})` : "Select Command";

    return (
        <Container flexDirection="column" flex={1} justifyContent="center" alignItems="center" gap={1}>
            <Panel flexDirection="column" title={title} padding={undefined} width={60} focused>
                <Container flexDirection="column" gap={1}>
                    {commands.map((item, idx) => {
                        const isSelected = idx === selectedIndex;
                        const label = item.label ?? item.command.displayName ?? item.command.name;
                        const description = item.description ?? item.command.description;
                        const modeIndicator = getModeIndicator(item.command);

                        return (
                            <MenuItem
                                key={item.command.name}
                                label={label}
                                description={description}
                                suffix={modeIndicator}
                                selected={isSelected}
                                onActivate={() => onSelect(item.command)}
                            />
                        );
                    })}
                </Container>
            </Panel>
        </Container>
    );
}

function getModeIndicator(command: Command): string {
    const navigableSubCommands = command.subCommands?.filter((sub) => sub.supportsTui()) ?? [];
    if (navigableSubCommands.length > 0) {
        return "2";
    }

    return "";
}
