import { EntityBase } from "./EntityBase";

export abstract class ComponentBase {
    parent: EntityBase;

    constructor(parent: EntityBase) {
        this.parent = parent;
    }

    abstract Update(): void;
}