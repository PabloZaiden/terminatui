import type { SelectProps } from "../../../semantic/types.ts";
import type { SelectOption as OpenTuiSelectOption } from "@opentui/core";

export function Select<TValue extends string>({
    options,
    value,
    focused,
    onChange,
    onSubmit,
}: SelectProps<TValue>) {
    const selectedIndex = Math.max(
        0,
        options.findIndex((opt) => opt.value === value)
    );

    return (
        <select
            options={
                options.map(
                    (opt): OpenTuiSelectOption => ({
                        name: opt.label,
                        description: "",
                        value: opt.value,
                    })
                )
            }
            selectedIndex={selectedIndex}
            focused={focused}
            onChange={(idx: number) => {
                const next = options[idx];
                if (next) {
                    onChange(next.value);
                }
            }}
            onSelect={(idx: number, option: OpenTuiSelectOption | null) => {
                if (option) {
                    onChange(option.value as TValue);
                } else {
                    const next = options[idx];
                    if (next) {
                        onChange(next.value);
                    }
                }

                // Only submit when OpenTUI triggers selection (Enter).
                // Arrow navigation uses onChange only.
                onSubmit?.();
            }}
            showScrollIndicator={false}
            showDescription={false}
            height={Math.min(options.length, 10)}
            width="100%"
            wrapSelection={true}
            selectedBackgroundColor="#61afef"
            selectedTextColor="#1e2127"
        />
    );
}
