import { HitboxBase } from "./HitboxBase";
import { TriggerState, HitboxType, DebugDrawColor } from "../../Models/CollisionModels";
import { EntityBase } from "../../Entities/EntityBase";
import { Vec2Utils } from "../../Utility/Vec2";
import { ScalarUtil } from "../../Utility/Scalar";

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

        let vertexes: number[] = [];

        const colorIndex = this.TriggerState == TriggerState.NotTrigger ? DebugDrawColor.Default : DebugDrawColor.Red
        for (let i = 0; i < 360 / 4; i++) {
            const pos = Vec2Utils.Sum(absTransform.Position, Vec2Utils.RotatePoint([radius, 0], ScalarUtil.ToRadian(i * 4)));
            vertexes.push(pos[0], pos[1], colorIndex);
        }

        return vertexes;
    }
}
