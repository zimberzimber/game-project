import { EntityBase } from "../../Entities/EntityBase";
import { Vec3 } from "../../Models/Vectors";
import { ITransformEventArgs } from "../../Models/Transform";
import { LightComponent } from "./Light";

export class DirectionalLightComponent extends LightComponent {
    private _direction = 0;
    get Direction(): number { return this._direction; }
    set Direction(direction: number) {
        this._direction = direction;
        this.CaulculateWebglData();
    }

    private _angle = 0;
    get Angle(): number { return this._angle; }
    set Angle(angle: number) {
        this._angle = angle;
        this.CaulculateWebglData();
    }

    constructor(parent: EntityBase, color: Vec3, radius: number, hardness: number, direction: number, lightAngle: number) {
        super(parent, color, radius, hardness);
        this._direction = direction;
        this._angle = lightAngle;
        this.CaulculateWebglData();
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        if (args.position || args.scale || args.rotation)
            this.CaulculateWebglData();
    }

    protected CaulculateWebglData(): void {
        super.CaulculateWebglData();
        const dir = (this._direction + this.Parent.worldRelativeTransform.Rotation) % 360;

        this._webglData[9] = dir;
        this._webglData[10] = this._angle;

        this._webglData[20] = dir;
        this._webglData[21] = this._angle;

        this._webglData[31] = dir;
        this._webglData[32] = this._angle;
    }
}