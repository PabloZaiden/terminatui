import { Container } from "../semantic/Container.tsx";
import { Label } from "../semantic/Label.tsx";

interface HeaderProps {
    /** Application name */
    name: string;
    /** Application version */
    version: string;
    /** Optional breadcrumb path (e.g., ["run", "config"]) */
    breadcrumb?: string[];
}

/**
 * Application header with name, version, and optional breadcrumb.
 */
export function Header({ name, version, breadcrumb }: HeaderProps) {
    const breadcrumbStr = breadcrumb?.length ? ` › ${breadcrumb.join(" › ")}` : "";

    return (
        <box flexDirection="column" flexShrink={0}>
            <Container flexDirection="row" justifyContent="space-between">
                <Label color="mutedText" bold>
                    {name}
                    {breadcrumbStr}
                </Label>
                <Label color="mutedText">v{version}</Label>
            </Container>
            <box height={1} flexShrink={0} />
        </box>
    );
}
