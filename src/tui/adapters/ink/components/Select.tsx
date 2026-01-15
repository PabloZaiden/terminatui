import InkSelectInput from "ink-select-input";
import { Text } from "ink";
import { useMemo } from "react";
import type { SelectProps } from "../../../semantic/types.ts";

type Item<TValue extends string> = { label: string; value: TValue };

type ItemComponentProps = {
    isSelected?: boolean;
    label: string;
};

function ItemComponent({ label }: ItemComponentProps) {
    // ink-select-input already provides its own selection marker.
    // Keep this as plain text to avoid double-marking.
    return <Text>{label}</Text>;
}

export function Select<TValue extends string>({ options, value, focused, onChange, onSubmit }: SelectProps<TValue>) {
    const items = useMemo(
        () => options.map((o) => ({ label: o.label, value: o.value }) as Item<TValue>),
        [options]
    );

    const initialIndex = Math.max(
        0,
        options.findIndex((o) => o.value === value)
    );

    // Force remount so ink-select-input respects updated initialIndex.
    const key = `${value}:${options.length}`;

    return (
        <InkSelectInput
            key={key}
            items={items as any}
            isFocused={focused}
            initialIndex={initialIndex}
            itemComponent={ItemComponent as any}
            onHighlight={(item: any) => onChange(item.value as TValue)}
            onSelect={() => onSubmit?.()}
        />
    );
}
