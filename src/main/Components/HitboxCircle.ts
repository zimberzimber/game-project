import { HitboxBase } from "../Bases/HitboxBase";
import { HitboxType } from "../Models/HitboxType";
import { EntityBase } from "../Bases/EntityBase";
import { _G } from "../Main";
import { WebglDrawData } from "../Models/WebglDrawData";

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

    GetDebugDrawData(): WebglDrawData | null { return null; }
}
