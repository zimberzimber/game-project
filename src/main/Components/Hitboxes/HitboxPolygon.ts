import { Vec2 } from "../../Models/Vectors";
import { HitboxBase } from "./HitboxBase";
import { EntityBase } from "../../Entities/EntityBase";
import { TriggerState, HitboxType } from "../../Models/CollisionModels";
import { Vec2Utils } from "../../Utility/Vec2";
import { DebugDrawColors } from "../../Models/GenericInterfaces";

export class HitboxPolygon extends HitboxBase {
    readonly HitboxType: HitboxType = HitboxType.Polygonal;
    private _polyline: Vec2[];

    set Polyline(points: Vec2[]) {
        this._polyline = points;
        this.CalculateBoundingRadius();
    }

    constructor(parent: EntityBase, points: Vec2[]) {
        super(parent);
        this.Polyline = points;
    }

    protected CalculateBoundingRadius() {
        this._polyline.forEach(p => {
            let distance = Vec2Utils.DistanceFrom00(p);
            if (distance > this._boundingRadius)
                this._boundingRadius = distance;
        });
    }

    get CanvasReletivePolyline(): Vec2[] {
        const trans = this._parent.WorldRelativeTransform;
        const radian = trans.RotationRadian;
        const polyline: Vec2[] = [];

        for (let i = 0; i < this._polyline.length; i++)
            polyline.push(Vec2Utils.Sum(trans.Position, Vec2Utils.RotatePoint(Vec2Utils.Mult(this._polyline[i], trans.Scale), radian)));

        return polyline;
    }

    // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
    get DebugDrawData(): number[] | null {
        if (this._polyline.length < 2) return null;

        const color = this.TriggerState == TriggerState.NotTrigger ? DebugDrawColors.Hitbox : DebugDrawColors.HitboxTrigger;
        const polyline = this.CanvasReletivePolyline;
        const vertexes: number[] = [];

        for (let i = 0; i < polyline.length; i++)
            vertexes.push(...polyline[i], ...color);

        return vertexes;
    };
}