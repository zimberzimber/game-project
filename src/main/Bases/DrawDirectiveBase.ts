import { ComponentBase } from "./ComponentBase";
import { EntityBase } from "./EntityBase";

export abstract class DrawDirectiveBase extends ComponentBase {
    constructor(parent: EntityBase) {
        super(parent);
    }

    abstract get WebGlData(): number[];
}
