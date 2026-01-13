import type { ModalComponent } from "../registry";

export abstract class ModalBase<TParams = unknown> {
    abstract getId(): string;
    abstract component(): ModalComponent<TParams>;

    constructor() { }
}
