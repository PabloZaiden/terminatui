import type { MenuButtonProps } from "../../../semantic/types.ts";
import { MenuItem } from "./MenuItem.tsx";

export function MenuButton({ label, selected, onActivate }: MenuButtonProps) {
    return (
        <box marginTop={1}>
            <MenuItem
                label={`[ ${label} ]`}
                selected={selected}
                onActivate={onActivate}
            />
        </box>
    );
}
