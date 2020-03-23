import { EntityBase } from "./EntityBase";
import { UpdateDelegate } from "./Delegates";

export abstract class ComponentBase {
    parent: EntityBase;

    constructor(parent: EntityBase) {
        this.parent = parent;
    }

    abstract Update(): void;
}