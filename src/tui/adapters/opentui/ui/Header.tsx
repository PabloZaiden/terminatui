import { Label } from "../components/Label.tsx";

interface HeaderProps {
    name: string;
    version: string;
    breadcrumb?: string[];
}

export function Header({ name, version, breadcrumb }: HeaderProps) {
    const breadcrumbStr = breadcrumb?.length ? ` → ${breadcrumb.join(" → ")}` : "";

    return (
        <box flexDirection="column" flexShrink={0}>
            <box flexDirection="row" justifyContent="space-between">
                <Label color="mutedText" bold>
                    {name}
                    {breadcrumbStr}
                </Label>
                <Label color="mutedText">v{version}</Label>
            </box>
            <box height={1} />
        </box>
    );
}
