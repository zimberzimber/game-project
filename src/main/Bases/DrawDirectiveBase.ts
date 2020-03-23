import { ComponentBase } from "./ComponentBase";
import { DrawLayer } from "../Models/DrawLayer";
import { EntityBase } from "./EntityBase";

export abstract class DrawDirectiveBase extends ComponentBase {

    DrawLayer: DrawLayer;

    constructor(parent: EntityBase, drawLayer: DrawLayer) {
        super(parent);
        this.DrawLayer = drawLayer;
    }

    abstract GetWebGlData(): number[];
    // abstract Draw(context: any): void;
    Update() { }
}
