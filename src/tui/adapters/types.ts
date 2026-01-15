import type { ReactNode } from "react";
import type {
    ButtonProps,
    CodeHighlightProps,
    CodeProps,
    ContainerProps,
    FieldProps,
    LabelProps,
    MenuButtonProps,
    MenuItemProps,
    OverlayProps,
    PanelProps,
    ScrollViewProps,
    SelectProps,
    SpacerProps,
    SpinnerProps,
    TextInputProps,
    ValueProps,
} from "../semantic/types.ts";

export interface KeyboardEvent {
    name: string;
    sequence?: string;
    ctrl?: boolean;
    shift?: boolean;
    meta?: boolean;
}

export type KeyHandler = (event: KeyboardEvent) => boolean;

export interface KeyboardAdapter {
    setActiveHandler: (id: string, handler: KeyHandler) => () => void;
    setGlobalHandler: (handler: KeyHandler) => () => void;
}

export interface RendererConfig {
    useAlternateScreen?: boolean;
}

export interface RendererComponents {
    Field: (props: FieldProps) => ReactNode;
    Button: (props: ButtonProps) => ReactNode;
    MenuButton: (props: MenuButtonProps) => ReactNode;
    MenuItem: (props: MenuItemProps) => ReactNode;

    Container: (props: ContainerProps) => ReactNode;
    Panel: (props: PanelProps) => ReactNode;
    ScrollView: (props: ScrollViewProps) => ReactNode;

    Overlay: (props: OverlayProps) => ReactNode;
    Spacer: (props: SpacerProps) => ReactNode;
    Spinner: (props: SpinnerProps) => ReactNode;

    Label: (props: LabelProps) => ReactNode;
    Value: (props: ValueProps) => ReactNode;
    Code: (props: CodeProps) => ReactNode;
    CodeHighlight: (props: CodeHighlightProps) => ReactNode;

    TextInput: (props: TextInputProps) => ReactNode;
    Select: (props: SelectProps) => ReactNode;
}

export interface Renderer {
    initialize: () => Promise<void>;
    render: (node: ReactNode) => void;
    destroy: () => void;
    supportCustomRendering: () => boolean;

    keyboard: KeyboardAdapter;
    components: RendererComponents;
}
