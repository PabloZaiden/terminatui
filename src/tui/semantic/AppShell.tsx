import type { ReactNode } from "react";

export interface AppIdentity {
    name: string;
    displayName?: string;
    version: string;
    breadcrumb?: string[];
}

export interface AppStatus {
    isExecuting: boolean;
    isCancelling: boolean;
    message: string;
}

export interface AppShellProps {
    app: AppIdentity;
    status: AppStatus;

    screen: ReactNode;
    modals: ReactNode[];

    /** Optional copy toast message (adapter-owned display) */
    copyToast?: string | null;
}

export function AppShell(_props: AppShellProps) {
    // This is a semantic-only marker component. The adapter owns layout.
    return null;
}
