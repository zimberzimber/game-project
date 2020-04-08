import { EntityBase } from "./EntityBase";
import { Transform } from "../Models/Transform";

export abstract class ComponentBase {
    parent: EntityBase;
    transform: Transform;

    constructor(parent: EntityBase) {
        this.parent = parent;
    }

    abstract Update(): void;
}