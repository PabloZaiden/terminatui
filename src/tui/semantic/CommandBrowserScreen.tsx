import type { AnyCommand } from "../../core/command.ts";

export interface CommandBrowserScreenProps {
    commandId: string[];
    commands: AnyCommand[];
    selectedCommandIndex: number;

    onOpenPath: (commandId: string[]) => void;
    onSelectCommand: (index: number) => void;
    onRunSelected: () => void;
}

export function CommandBrowserScreen(_props: CommandBrowserScreenProps) {
    // Semantic-only marker component. Adapter renders this.
    return null;
}
