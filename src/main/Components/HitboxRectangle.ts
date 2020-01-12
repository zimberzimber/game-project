import { HitboxBase } from "../Bases/HitboxBase";
import { HitboxType } from "../Models/HitboxType";
import { EntityBase } from "../Bases/EntityBase";
import { _G } from "../Main";
import { TriggerState } from "../Models/TriggerState";

export class HitboxRectangle extends HitboxBase {
    HitboxType: HitboxType = HitboxType.Rectangular;
    private width: number;
    private height: number;

    constructor(parent: EntityBase, width: number, height: number) {
        super(parent);
        this.width = width;
        this.height = height;
        this.CalculateOverallHitboxRadius();
    }

    protected CalculateOverallHitboxRadius(): void {
        this.HitboxOverallRadius = Math.sqrt(Math.pow(this.width, 2) + Math.pow(this.height, 2)) / 2;
    }

    GetHeight(): number { return this.height; }
    SetHeight(height: number): void {
        this.height = height;
        this.CalculateOverallHitboxRadius();
    }

    GetWidth(): number { return this.width; }
    SetWidth(width: number): void {
        this.width = width;
        this.CalculateOverallHitboxRadius();
    }

    Update(): void {

    }

    DrawHitbox(context: any): void {
        if (!this.CollisionEnabled) return;

        const x = this.parent.transform.position.x;
        const y = this.parent.transform.position.y;

        if (this.GetTriggerState() != TriggerState.NotTrigger)
            context.strokeStyle = HitboxBase.DebugHitboxColor;
        else
            context.strokeStyle = HitboxBase.DebugTriggerColor;

        context.strokeRect(x - this.width / 2, y - this.height / 2, this.width, this.height);
    }
}
