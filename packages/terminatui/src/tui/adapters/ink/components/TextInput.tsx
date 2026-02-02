import InkTextInput from "ink-text-input";
import { Text } from "ink";
import type { TextInputProps } from "../../../semantic/types.ts";

export function TextInput({ value, placeholder, focused, onChange, onSubmit }: TextInputProps) {
    // ink-text-input renders nothing if you pass empty placeholder; provide a minimal hint.
    const hint = placeholder ?? "";

    return (
        <Text>
            <InkTextInput
                value={value}
                placeholder={hint}
                focus={focused}
                onChange={onChange}
                onSubmit={() => {
                    onSubmit?.();
                }}
            />
        </Text>
    );
}
