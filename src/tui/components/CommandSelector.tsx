import type { Command } from "../../core/command.ts";
import { MenuItem } from "../semantic/MenuItem.tsx";
import { Container } from "../semantic/Container.tsx";
import { Panel } from "../semantic/Panel.tsx";

interface CommandItem {
    /** The command object */
    command: Command;
    /** Display label (defaults to command name) */
    label?: string;
    /** Description (defaults to command description) */
    description?: string;
}

interface CommandSelectorProps {
    /** Commands to display */
    commands: CommandItem[];
    /** Currently selected index */
    selectedIndex: number;
    /** Called when a command is selected */
    onSelect: (command: Command) => void;
    /** Breadcrumb path for nested commands */
    breadcrumb?: string[];
}

/**
 * Command selection menu.
 */
export function CommandSelector({
    commands,
    selectedIndex,
    onSelect,
    breadcrumb,
}: CommandSelectorProps) {

    const title = breadcrumb?.length 
        ? `Select Command (${breadcrumb.join(" › ")})`
        : "Select Command";

    return (
        <Container flexDirection="column" flex={1} justifyContent="center" alignItems="center" gap={1}>
            <Panel
                flexDirection="column"
                title={title}
                padding={undefined}
                width={60}
                focused
            >
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

/**
 * Get mode indicator for a command (e.g., "[cli]", "[tui]", "→" for subcommands).
 */
function getModeIndicator(command: Command): string {
    // Show navigation indicator for container commands with navigable subcommands
    // (excluding commands that don't support TUI)
    const navigableSubCommands = command.subCommands?.filter((sub) => sub.supportsTui()) ?? [];
    if (navigableSubCommands.length > 0) {
        return "→";
    }
    
    return "";
}
