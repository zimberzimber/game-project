import { HitboxBase } from "./HitboxBase";
import { TriggerState, HitboxType, DebugDrawColor } from "../../Models/CollisionModels";
import { EntityBase } from "../../Bases/EntityBase";

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
        this._hitboxOverallRadius = Math.sqrt(Math.pow(this._width, 2) + Math.pow(this._height, 2)) / 2;
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
    get DebugDrawData(): number[] | null {
        const absTransform = this._parent.worldRelativeTransform;
        const width = this._width * absTransform.Scale[0] / 2;
        const height = this._height * absTransform.Scale[1] / 2;

        const colorIndex = this.TriggerState == TriggerState.NotTrigger ? DebugDrawColor.Default : DebugDrawColor.Red
        return [
            absTransform.Position[0] + width, absTransform.Position[1] + height, colorIndex,
            absTransform.Position[0] - width, absTransform.Position[1] + height, colorIndex,
            absTransform.Position[0] - width, absTransform.Position[1] - height, colorIndex,
            absTransform.Position[0] + width, absTransform.Position[1] - height, colorIndex,
        ];
    };
}
