import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";
import { Vec3 } from "../../Models/Vectors";

export class Light extends ComponentBase {
    private _color: Vec3;
    private _radius: number;
    private _hardness: number;

    get Color(): Vec3 { return this._color; }
    set Color(color: Vec3) { this._color = color; }

    get Radius(): number { return this._radius; }
    set Radius(radius: number) { this._radius = radius; }

    get Hardness(): number { return this._hardness; }
    set Hardness(hardness: number) { this._hardness = hardness; }

    constructor(parent: EntityBase, color: Vec3, radius: number, hardness: number) {
        super(parent);
        this._color = color;
        this._radius = radius;
        this._hardness = hardness;
    }

    get WebglData(): number[] {
        if (!this.Enabled) return [];
        return [...this.Parent.worldRelativeTransform.Position, ...this._color, this._radius, this._hardness];
    }
}
