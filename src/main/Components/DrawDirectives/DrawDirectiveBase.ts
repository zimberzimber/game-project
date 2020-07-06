import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";
import { ITransformObserver, ITransformEventArgs } from "../../Models/Transform";
import { IAttributesIndexes } from "../../Renderers/_RendererInterfaces";

export abstract class DrawDirectiveBase extends ComponentBase implements ITransformObserver {
    protected _webglData: IAttributesIndexes = { attributes: [], indexes: [] };
    get WebGlData(): IAttributesIndexes { return this._webglData; }

    protected _boundingRadius: number = 0;
    get BoundingRadius(): number { return this._boundingRadius; }

    abstract get ImageId(): number;

    constructor(parent: EntityBase) {
        super(parent);
        this.Parent.transform.Subscribe(this);
    }

    Unitialize() {
        this.Parent.transform.Unsubscribe(this);
        super.Unitialize();
    }

    abstract OnObservableNotified(args: ITransformEventArgs): void;
}
