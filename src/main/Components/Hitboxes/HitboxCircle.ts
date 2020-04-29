import { HitboxBase } from "../../Bases/HitboxBase";
import { HitboxType } from "../../Models/HitboxType";
import { EntityBase } from "../../Bases/EntityBase";
import { WebglDrawData } from "../../Models/WebglDrawData";
import { TriggerState } from "../../Models/TriggerState";
import { Vec2Utils } from "../../Utility/Vec2";
import { ScalarUtil } from "../../Utility/Scalar";

export class HitboxCircle extends HitboxBase {
    HitboxType: HitboxType = HitboxType.Circular;
    private radius: number;

    constructor(parent: EntityBase, radius: number) {
        super(parent);
        this.radius = radius;
        this.CalculateOverallHitboxRadius();
    }

    protected CalculateOverallHitboxRadius(): void {
        this.HitboxOverallRadius = this.radius;
    }

    GetRadius(): number { return this.radius; }
    SetRadius(radius: number): void {
        this.radius = radius;
        this.CalculateOverallHitboxRadius();
    }

    GetDebugDrawData(): WebglDrawData | null {
        if (!this.CollisionEnabled) return null;

        const colorY = this.GetTriggerState() == TriggerState.NotTrigger ? 0 : 0.01
        const absTransform = this.parent.GetWorldRelativeTransform();
        const radius = (absTransform.scale[0] + absTransform.scale[1]) / 2 * this.radius;

        let vertexes: number[] = [];
        let indexes: number[] = [];

        for (let i = 0; i < 360 / 4; i++) {
            const pos = Vec2Utils.Sum(absTransform.position, Vec2Utils.RotatePoint([radius, 0], ScalarUtil.ToRadian(i * 4)));
            vertexes = vertexes.concat([pos[0], pos[1], 1, 0, 0, 0, 0, 1, colorY])
            indexes.push(i);
        }
        indexes.push(0);

        return { vertexes, indexes };
    }
}
