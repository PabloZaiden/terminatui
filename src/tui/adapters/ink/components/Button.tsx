import { Text } from "ink";
import type { ButtonProps } from "../../../semantic/types.ts";

export function Button({ label, selected, onActivate }: ButtonProps) {
    const prefix = selected ? "> " : "  ";
    return (
        <Text
            {...(onActivate
                ? {
                      onClick: () => {
                          onActivate();
                      },
                  }
                : {})}
        >
            {prefix}
            {label}
        </Text>
    );
}
