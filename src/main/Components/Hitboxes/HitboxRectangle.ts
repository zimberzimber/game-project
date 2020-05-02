import { HitboxBase } from "../../Bases/HitboxBase";
import { HitboxType } from "../../Models/HitboxType";
import { EntityBase } from "../../Bases/EntityBase";
import { WebglDrawData } from "../../Models/WebglDrawData";
import { TriggerState } from "../../Models/TriggerState";

export class HitboxRectangle extends HitboxBase {
    HitboxType: HitboxType = HitboxType.Rectangular;
    private _width: number;
    private _height: number;

    constructor(parent: EntityBase, width: number, height: number) {
        super(parent);
        this._width = width;
        this._height = height;
        this.CalculateOverallHitboxRadius();
    }

    protected CalculateOverallHitboxRadius(): void {
        this.HitboxOverallRadius = Math.sqrt(Math.pow(this._width, 2) + Math.pow(this._height, 2)) / 2;
    }

    get Height(): number { return this._height; }
    set Height(height: number) {
        this._height = height;
        this.CalculateOverallHitboxRadius();
    }


    get Width(): number { return this._width; }
    set Width(width: number) {
        this._width = width;
        this.CalculateOverallHitboxRadius();
    }

    // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
    get DebugDrawData(): WebglDrawData | null {
        if (!this.CollisionEnabled) return null;

        const absTransform = this._parent.worldRelativeTransform;
        const colorY = this.TriggerState == TriggerState.NotTrigger ? 0 : 0.01
        const width = this._width * absTransform.Scale[0] / 2;
        const height = this._height * absTransform.Scale[1] / 2;

        return {
            vertexes: [
                absTransform.Position[0] + width, absTransform.Position[1] + height, 1, 0, 0, 0, 0, 1, colorY,
                absTransform.Position[0] - width, absTransform.Position[1] + height, 1, 0, 0, 0, 0, 1, colorY,
                absTransform.Position[0] - width, absTransform.Position[1] - height, 1, 0, 0, 0, 0, 1, colorY,
                absTransform.Position[0] + width, absTransform.Position[1] - height, 1, 0, 0, 0, 0, 1, colorY,
            ],
            indexes: [0, 1, 2, 3, 0]
        };
    };
}
