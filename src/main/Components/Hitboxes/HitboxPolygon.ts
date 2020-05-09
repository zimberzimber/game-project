import { Vec2 } from "../../Models/Vec2";
import { HitboxBase } from "./HitboxBase";
import { EntityBase } from "../../Bases/EntityBase";
import { TriggerState, HitboxType } from "../../Models/CollisionModels";
import { Vec2Utils } from "../../Utility/Vec2";
import { WebglDrawData } from "../../Models/WebglDrawData";

export class HitboxPolygon extends HitboxBase {
    HitboxType: HitboxType = HitboxType.Polygonal;
    private Polyline: Vec2[];

    constructor(parent: EntityBase, ...points: Vec2[]) {
        super(parent);
        this.Polyline = points;
        this.CalculateOverallHitboxRadius();
    }

    protected CalculateOverallHitboxRadius() {
        this.Polyline.forEach(p => {
            let distance = Vec2Utils.DistanceFrom00(p);
            if (distance > this._hitboxOverallRadius)
                this._hitboxOverallRadius = distance;
        });
    }

    get CanvasReletivePolyline(): Vec2[] {
        const trans = this._parent.worldRelativeTransform;
        const radian = trans.RotationRadian;
        const polyline: Vec2[] = [];

        for (let i = 0; i < this.Polyline.length; i++)
            polyline[i] = Vec2Utils.Sum(trans.Position, Vec2Utils.RotatePoint(Vec2Utils.Mult(this.Polyline[i], trans.Scale), radian));

        return polyline;
    }

    // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
    get DebugDrawData(): WebglDrawData | null {
        if (this.Polyline.length < 2) return null;

        let vertexes: number[] = [];
        let indexes: number[] = [];

        const colorY = this.TriggerState == TriggerState.NotTrigger ? 0 : 0.01
        const polyline = this.CanvasReletivePolyline;
        for (let i = 0; i < polyline.length; i++) {
            vertexes.push(polyline[i][0], polyline[i][1], 1, 0, 0, 0, 0, 1, colorY);
            indexes.push(i);
        }
        indexes.push(0);

        return { vertexes, indexes };
    };
}