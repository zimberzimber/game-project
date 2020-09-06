import { HitboxBase } from "./HitboxBase";
import { TriggerState, HitboxType } from "../../Models/CollisionModels";
import { EntityBase } from "../../Entities/EntityBase";
import { Vec2Utils } from "../../Utility/Vec2";
import { ScalarUtil } from "../../Utility/Scalar";
import { DebugDrawColors } from "../../Models/GenericInterfaces";

export class HitboxCircle extends HitboxBase {
    readonly HitboxType: HitboxType = HitboxType.Circular;
    private _radius: number;

    constructor(parent: EntityBase, radius: number) {
        super(parent);
        this._radius = radius;
        this.CalculateBoundingRadius();
    }

    protected CalculateBoundingRadius(): void {
        this._boundingRadius = this._radius;
    }

    get Radius(): number { return this._radius; }
    set Radius(radius: number) {
        this._radius = radius;
        this.CalculateBoundingRadius();
    }

    get DebugDrawData(): number[] | null {
        const absTransform = this._parent.worldRelativeTransform;
        const radius = (absTransform.Scale[0] + absTransform.Scale[1]) / 2 * this._radius;
        const color = this.TriggerState == TriggerState.NotTrigger ? DebugDrawColors.Hitbox : DebugDrawColors.HitboxTrigger;

        const vertexes: number[] = [];

        for (let i = 0; i < 360 / 4; i++) {
            const pos = Vec2Utils.Sum(absTransform.Position, Vec2Utils.RotatePoint([radius, 0], ScalarUtil.ToRadian(i * 4)));
            vertexes.push(...pos, ...color);
        }

        return vertexes;
    }
}
