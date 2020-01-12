import { HitboxBase } from "../Bases/HitboxBase";
import { HitboxType } from "../Models/HitboxType";
import { EntityBase } from "../Bases/EntityBase";
import { _G } from "../Main";
import { TriggerState } from "../Models/TriggerState";

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
    
    DrawHitbox(context: any): void {
        if (!this.CollisionEnabled) return;

        if (this.GetTriggerState() != TriggerState.NotTrigger)
            context.strokeStyle = HitboxBase.DebugHitboxColor;
        else
            context.strokeStyle = HitboxBase.DebugTriggerColor;

        context.beginPath();
        context.arc(this.parent.transform.position.x, this.parent.transform.position.y, this.radius, 0, 2 * Math.PI);
        context.stroke();
    }
}
