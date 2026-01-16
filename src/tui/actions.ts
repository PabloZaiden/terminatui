export type TuiAction =
    | { type: "nav.back" }
    | { type: "clipboard.copy" }
    | { type: "logs.open" };
