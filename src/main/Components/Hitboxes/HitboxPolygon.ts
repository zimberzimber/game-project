import { Vec2 } from "../../Models/Vectors";
import { HitboxBase } from "./HitboxBase";
import { EntityBase } from "../../Entities/EntityBase";
import { TriggerState, HitboxType } from "../../Models/CollisionModels";
import { Vec2Utils } from "../../Utility/Vec2";
import { DebugDrawColors } from "../../Models/GenericInterfaces";

export class HitboxPolygon extends HitboxBase {
    readonly HitboxType: HitboxType = HitboxType.Polygonal;
    private Polyline: Vec2[];

    constructor(parent: EntityBase, ...points: Vec2[]) {
        super(parent);
        this.Polyline = points;
        this.CalculateBoundingRadius();
    }

    protected CalculateBoundingRadius() {
        this.Polyline.forEach(p => {
            let distance = Vec2Utils.DistanceFrom00(p);
            if (distance > this._boundingRadius)
                this._boundingRadius = distance;
        });
    }

    get CanvasReletivePolyline(): Vec2[] {
        const trans = this._parent.WorldRelativeTransform;
        const radian = trans.RotationRadian;
        const polyline: Vec2[] = [];

        for (let i = 0; i < this.Polyline.length; i++)
            polyline.push(Vec2Utils.Sum(trans.Position, Vec2Utils.RotatePoint(Vec2Utils.Mult(this.Polyline[i], trans.Scale), radian)));

        return polyline;
    }

    // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
    get DebugDrawData(): number[] | null {
        if (this.Polyline.length < 2) return null;

        const color = this.TriggerState == TriggerState.NotTrigger ? DebugDrawColors.Hitbox : DebugDrawColors.HitboxTrigger;
        const polyline = this.CanvasReletivePolyline;
        const vertexes: number[] = [];

        for (let i = 0; i < polyline.length; i++)
            vertexes.push(...polyline[i], ...color);

        return vertexes;
    };
}