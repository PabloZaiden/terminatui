import type { TextInputProps } from "../../../semantic/types.ts";

export function TextInput({ value, placeholder, focused, onChange, onSubmit }: TextInputProps) {
    return (
        <input
            value={value}
            placeholder={placeholder}
            focused={focused}
            onInput={(next: string) => onChange(next)}
            onSubmit={() => onSubmit?.()}
        />
    );
}
