import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";
import { Vec3 } from "../../Models/Vectors";
import { ITransformObserver, ITransformEventArgs } from "../../Models/Transform";
import { ScalarUtil } from "../../Utility/Scalar";

// Multiplying radius by 1.85 gives a good enough distance to the desired points in the triangle
const triMult = 1.85;

export class LightComponent extends ComponentBase implements ITransformObserver {
    protected _color: Vec3;
    get Color(): Vec3 { return this._color; }
    set Color(color: Vec3) {
        this._color = [
            ScalarUtil.Clamp(0, color[0], 1),
            ScalarUtil.Clamp(0, color[1], 1),
            ScalarUtil.Clamp(0, color[2], 1),
        ];
        this.CaulculateWebglData();
    }

    protected _radius: number;
    get Radius(): number { return this._radius; }
    set Radius(radius: number) {
        this._radius = radius;
        this.CaulculateWebglData();
    }

    protected _hardness: number;
    get Hardness(): number { return this._hardness; }
    set Hardness(hardness: number) {
        this._hardness = ScalarUtil.Clamp(0, hardness, 1);
        this.CaulculateWebglData();
    }

    protected _lightMultiplier: number = 1;
    get LightMultiplier(): number { return this._lightMultiplier; }
    set LightMultiplier(multiplier: number) {
        this._lightMultiplier = ScalarUtil.Clamp(0, multiplier, 1);
        this.CaulculateWebglData();
    }

    protected _webglData: number[] = [];
    get WebglData(): number[] { return this.Enabled ? this._webglData : []; }

    protected _boundingRadius: number = 0;
    get BoundingRadius(): number { return this._boundingRadius; }

    constructor(parent: EntityBase, color: Vec3, radius: number, hardness: number) {
        super(parent);
        this._radius = radius;
        this.Parent.WorldRelativeTransform.Subscribe(this);
        this.Color = color; // Also calculates webgl data
        this.Hardness = hardness; // Also calculates webgl data
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        if (args.position || args.scale)
            this.CaulculateWebglData();
    }

    protected CaulculateWebglData(): void {
        const trans = this.Parent.WorldRelativeTransform;
        const scaledRadius = (trans.Scale[0] + trans.Scale[1]) / 2 * this._radius;
        this._boundingRadius = scaledRadius;

        const r = this._color[0] * this._lightMultiplier;
        const g = this._color[1] * this._lightMultiplier;
        const b = this._color[2] * this._lightMultiplier;

        this._webglData = [
            trans.Position[0], trans.Position[1] + scaledRadius * triMult, ...trans.Position, r, g, b, scaledRadius, this._hardness, 0, 360,
            trans.Position[0] - scaledRadius * triMult, trans.Position[1] - scaledRadius, ...trans.Position, r, g, b, scaledRadius, this._hardness, 0, 360,
            trans.Position[0] + scaledRadius * triMult, trans.Position[1] - scaledRadius, ...trans.Position, r, g, b, scaledRadius, this._hardness, 0, 360,
        ];
    }

    Uninitialize(): void {
        this.Parent.WorldRelativeTransform.Unsubscribe(this);
        super.Uninitialize();
    }
}

