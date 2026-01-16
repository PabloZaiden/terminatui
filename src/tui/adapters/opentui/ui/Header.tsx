import { Container } from "../../../semantic/Container.tsx";
import { Label } from "../../../semantic/Label.tsx";
import { Spacer } from "../../../semantic/Spacer.tsx";

interface HeaderProps {
    name: string;
    version: string;
    breadcrumb?: string[];
}

export function Header({ name, version, breadcrumb }: HeaderProps) {
    const breadcrumbStr = breadcrumb?.length ? ` 3 ${breadcrumb.join(" 3 ")}` : "";

    return (
        <Container flexDirection="column" noShrink>
            <Container flexDirection="row" justifyContent="space-between">
                <Label color="mutedText" bold>
                    {name}
                    {breadcrumbStr}
                </Label>
                <Label color="mutedText">v{version}</Label>
            </Container>
            <Spacer size={1} />
        </Container>
    );
}
