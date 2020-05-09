import { HitboxBase } from "./HitboxBase";
import { TriggerState, HitboxType } from "../../Models/CollisionModels";
import { EntityBase } from "../../Bases/EntityBase";
import { WebglDrawData } from "../../Models/WebglDrawData";
import { Vec2Utils } from "../../Utility/Vec2";
import { ScalarUtil } from "../../Utility/Scalar";

export class HitboxCircle extends HitboxBase {
    HitboxType: HitboxType = HitboxType.Circular;
    private _radius: number;

    constructor(parent: EntityBase, radius: number) {
        super(parent);
        this._radius = radius;
        this.CalculateOverallHitboxRadius();
    }

    protected CalculateOverallHitboxRadius(): void {
        this._hitboxOverallRadius = this._radius;
    }

    get Radius(): number { return this._radius; }
    set Radius(radius: number) {
        this._radius = radius;
        this.CalculateOverallHitboxRadius();
    }

    get DebugDrawData(): WebglDrawData | null {
        const colorY = this.TriggerState == TriggerState.NotTrigger ? 0 : 0.01
        const absTransform = this._parent.worldRelativeTransform;
        const radius = (absTransform.Scale[0] + absTransform.Scale[1]) / 2 * this._radius;

        let vertexes: number[] = [];
        let indexes: number[] = [];

        for (let i = 0; i < 360 / 4; i++) {
            const pos = Vec2Utils.Sum(absTransform.Position, Vec2Utils.RotatePoint([radius, 0], ScalarUtil.ToRadian(i * 4)));
            vertexes.push(pos[0], pos[1], absTransform.Depth, 0, 0, 0, 0, 1, colorY);
            indexes.push(i);
        }
        indexes.push(0);

        return { vertexes, indexes };
    }
}
