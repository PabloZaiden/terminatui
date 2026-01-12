import { useMemo } from "react";
import type { ScreenEntry } from "../context/NavigationContext.tsx";
import type { Routes } from "../routes.ts";
import type { AnyCommand } from "../../core/command.ts";
import { CommandSelector } from "../components/CommandSelector.tsx";
import { AppContext } from "../../core/context.ts";

interface CommandSelectScreenProps {
    entry: ScreenEntry<Routes, "command-select">;
    onSelectCommand: (cmd: AnyCommand, path: string[], selectedIndex: number) => void;
    onChangeSelection: (index: number) => void;
    onBack: () => void;
    commands?: AnyCommand[];
}

export function CommandSelectScreen({ entry, onSelectCommand, onChangeSelection, onBack, commands: providedCommands }: CommandSelectScreenProps) {
    const { commandPath, selectedIndex = 0 } = entry.params ?? { commandPath: [], selectedIndex: 0 };
    const serviceCommands = AppContext.current.getService<AnyCommand[]>("commands") ?? [];
    const commands = providedCommands ?? serviceCommands;

    const currentCommands = useMemo<AnyCommand[]>(() => {
        if (commandPath.length === 0) {
            return commands.filter((cmd) => cmd.supportsTui());
        }

        let current: AnyCommand[] = commands;
        for (const pathPart of commandPath) {
            const found = current.find((c) => c.name === pathPart);
            if (found?.subCommands) {
                current = found.subCommands.filter((sub) => sub.supportsTui());
            } else {
                break;
            }
        }
        return current;
    }, [commands, commandPath]);

    const breadcrumb = useMemo(() => {
        if (commandPath.length === 0) return undefined;

        const displayNames: string[] = [];
        let current: AnyCommand[] = commands;

        for (const pathPart of commandPath) {
            const found = current.find((c) => c.name === pathPart);
            if (found) {
                displayNames.push(found.displayName ?? found.name);
                if (found.subCommands) {
                    current = found.subCommands;
                }
            } else {
                displayNames.push(pathPart);
            }
        }

        return displayNames;
    }, [commandPath, commands]);

    const items = currentCommands.map((cmd) => ({
        command: cmd,
        label: cmd.displayName ?? cmd.name,
        description: cmd.description,
    }));

    const handleSelect = (cmd: AnyCommand) => {
        onSelectCommand(cmd, commandPath, selectedIndex);
    };

    const handleSelectionChange = (index: number) => {
        onChangeSelection(index);
    };

    return (
        <CommandSelector
            commands={items}
            selectedIndex={selectedIndex}
            onSelectionChange={handleSelectionChange}
            onSelect={handleSelect}
            onExit={onBack}
            breadcrumb={breadcrumb}
        />
    );
}
