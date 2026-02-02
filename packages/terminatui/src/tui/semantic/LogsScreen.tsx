export interface LogsScreenProps {
    items: { level: string; message: string; timestamp: number }[];
    onClose: () => void;
}

export function LogsScreen(_props: LogsScreenProps) {
    // Semantic-only marker component. Adapter renders this.
    return null;
}
