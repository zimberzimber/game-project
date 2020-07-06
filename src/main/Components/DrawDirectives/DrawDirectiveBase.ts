import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";
import { ITransformObserver, ITransformEventArgs } from "../../Models/Transform";

export abstract class DrawDirectiveBase extends ComponentBase implements ITransformObserver {
    protected _webglData: number[] = [];
    get WebGlData(): number[] { return this._webglData; }
    
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
