import type { ButtonProps } from "../semantic/types.ts";
import { Theme } from "../theme.ts";

export interface ActionButtonProps {
    /** Button label */
    label: string;
    /** Whether this button is selected */
    isSelected: boolean;
    /** Optional spinner frame for loading state */
    spinnerFrame?: string;
}

/**
 * @deprecated Use semantic `Button` via renderer adapter.
 */
export function ActionButton({ label, isSelected, spinnerFrame }: ActionButtonProps) {
    const displayLabel = spinnerFrame ? `${spinnerFrame} ${label}...` : `[ ${label} ]`;

    return (
        <Button
            label={displayLabel}
            selected={isSelected}
        />
    );
}

export function Button({ label, selected, onActivate }: ButtonProps) {
    const prefix = selected ? "► " : "  ";

    if (selected) {
        return (
            <box marginTop={1}>
                <text fg="#000000" bg={Theme.actionButton} {...({ onClick: onActivate } as any)}>
                    {prefix}{label}
                </text>
            </box>
        );
    }

    return (
        <box marginTop={1}>
            <text fg={Theme.actionButton} {...({ onClick: onActivate } as any)}>
                {prefix}{label}
            </text>
        </box>
    );
}
