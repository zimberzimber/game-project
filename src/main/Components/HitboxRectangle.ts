import { HitboxBase } from "../Bases/HitboxBase";
import { HitboxType } from "../Models/HitboxType";
import { EntityBase } from "../Bases/EntityBase";
import { _G } from "../Main";
import { WebglDrawData } from "../Models/WebglDrawData";
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

    // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
    GetDebugDrawData(): WebglDrawData | null {
        if (!this.CollisionEnabled) return null;

        const colorY = this.GetTriggerState() == TriggerState.NotTrigger ? 0 : 0.01

        const vertexes: number[] = [
            this.parent.transform.position[0] + this.width / 2, this.parent.transform.position[1] + this.height / 2, 1, 0, 0, 0, 0, 1, colorY,
            this.parent.transform.position[0] - this.width / 2, this.parent.transform.position[1] + this.height / 2, 1, 0, 0, 0, 0, 1, colorY,
            this.parent.transform.position[0] - this.width / 2, this.parent.transform.position[1] - this.height / 2, 1, 0, 0, 0, 0, 1, colorY,
            this.parent.transform.position[0] + this.width / 2, this.parent.transform.position[1] - this.height / 2, 1, 0, 0, 0, 0, 1, colorY,
        ];

        const indexes: number[] = [0, 1, 2, 3, 0];

        return { vertexes, indexes };
    };
}
