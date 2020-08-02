import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";
import { ITransformObserver, ITransformEventArgs } from "../../Models/Transform";
import { IAttributesIndexes } from "../../Renderers/_RendererInterfaces";
import { Vec2 } from "../../Models/Vectors";
import { Vec2Utils } from "../../Utility/Vec2";
import { HorizontalAlignment, VerticalAlignment, IAlignmentContainer } from "../../Models/GenericInterfaces";
import { ISpriteFrame } from "../../Models/SpriteModels";

export abstract class DrawDirectiveBase extends ComponentBase implements ITransformObserver {
    protected _webglData: IAttributesIndexes = { attributes: [], indexes: [] };
    get WebGlData(): IAttributesIndexes { return this._webglData; }

    protected _boundingRadius: number = 0;
    get BoundingRadius(): number { return this._boundingRadius + Math.max(this._drawOffset[0], this._drawOffset[1]); }

    protected _drawOffset: Vec2 = [0, 0];
    get DrawOffset(): Vec2 { return Vec2Utils.Copy(this._drawOffset); }
    set DrawOffset(offset: Vec2) {
        this._drawOffset = Vec2Utils.Copy(offset);
        this.UpdateWebglData();
    }

    protected _horizontalAlignment: HorizontalAlignment = HorizontalAlignment.Middle;
    get HorizontalAlignment(): HorizontalAlignment { return this._horizontalAlignment; }
    set HorizontalAlignment(alignment: HorizontalAlignment) {
        this._horizontalAlignment = alignment;
        this.UpdateWebglData();
    }

    protected _verticalAlignment: VerticalAlignment = VerticalAlignment.Middle;
    get VerticalAlignment(): VerticalAlignment { return this._verticalAlignment; }
    set VerticalAlignment(alignment: VerticalAlignment) {
        this._verticalAlignment = alignment;
        this.UpdateWebglData();
    }

    get Alignment(): IAlignmentContainer { return { horizontal: this._horizontalAlignment, vertical: this._verticalAlignment }; }
    set Alignment(alignment: IAlignmentContainer) {
        this._verticalAlignment = alignment.vertical;
        this._horizontalAlignment = alignment.horizontal;
        this.UpdateWebglData();
    }

    protected _opacity: number = 1;
    get Opacity(): number { return this._opacity; }
    set Opacity(opacity: number) {
        this._opacity = opacity;
        this.UpdateWebglData();
    }

    abstract get IsTranslucent(): boolean;
    abstract get ImageId(): number;

    constructor(parent: EntityBase) {
        super(parent);
        this.Parent.worldRelativeTransform.Subscribe(this);
    }

    Unitialize() {
        this.Parent.worldRelativeTransform.Unsubscribe(this);
        super.Unitialize();
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        this.UpdateWebglData();
    }
    protected abstract UpdateWebglData(): void;
}
