import { HitboxBase } from "./HitboxBase";
import { TriggerState, HitboxType } from "../../Models/CollisionModels";
import { EntityBase } from "../../Entities/EntityBase";
import { DebugDrawColors } from "../../Models/GenericInterfaces";

export class HitboxRectangle extends HitboxBase {
    readonly HitboxType: HitboxType = HitboxType.Rectangular;
    private _width: number;
    private _height: number;

    constructor(parent: EntityBase, width: number, height: number) {
        super(parent);
        this._width = width;
        this._height = height;
        this.CalculateBoundingRadius();
    }

    protected CalculateBoundingRadius(): void {
        this._boundingRadius = Math.sqrt(Math.pow(this._width, 2) + Math.pow(this._height, 2)) / 2;
    }

    get Height(): number { return this._height; }
    set Height(height: number) {
        this._height = height;
        this.CalculateBoundingRadius();
    }


    get Width(): number { return this._width; }
    set Width(width: number) {
        this._width = width;
        this.CalculateBoundingRadius();
    }

    // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
    get DebugDrawData(): number[] | null {
        const absTransform = this._parent.WorldRelativeTransform;
        const width = this._width * absTransform.Scale[0] / 2;
        const height = this._height * absTransform.Scale[1] / 2;

        const color = this.TriggerState == TriggerState.NotTrigger ? DebugDrawColors.Hitbox : DebugDrawColors.HitboxTrigger;
        return [
            absTransform.Position[0] + width, absTransform.Position[1] + height, ...color,
            absTransform.Position[0] - width, absTransform.Position[1] + height, ...color,
            absTransform.Position[0] - width, absTransform.Position[1] - height, ...color,
            absTransform.Position[0] + width, absTransform.Position[1] - height, ...color,
        ];
    };
}
