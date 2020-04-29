import { Vec2 } from "../../Models/Vec2";
import { HitboxBase } from "../../Bases/HitboxBase";
import { HitboxType } from "../../Models/HitboxType";
import { EntityBase } from "../../Bases/EntityBase";
import { TriggerState } from "../../Models/TriggerState";
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
            if (distance > this.HitboxOverallRadius)
                this.HitboxOverallRadius = distance;
        });
    }

    GetCanvasReletivePolyline(): Vec2[] {
        const absTransform = this.parent.GetWorldRelativeTransform();
        const radian = absTransform.GetRotationRadian();
        const polyline: Vec2[] = [];

        for (let i = 0; i < this.Polyline.length; i++)
            polyline[i] = Vec2Utils.Sum(absTransform.position, Vec2Utils.RotatePoint(Vec2Utils.Mult(this.Polyline[i], absTransform.scale), radian));

        return polyline;
    }

    // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
    GetDebugDrawData(): WebglDrawData | null {
        if (!this.CollisionEnabled) return null;
        if (this.Polyline.length < 2) return null;

        let vertexes: number[] = [];
        let indexes: number[] = [];

        const colorY = this.GetTriggerState() == TriggerState.NotTrigger ? 0 : 0.01
        const polyline = this.GetCanvasReletivePolyline();
        for (let i = 0; i < polyline.length; i++) {
            vertexes = vertexes.concat([polyline[i][0], polyline[i][1], 1, 0, 0, 0, 0, 1, colorY])
            indexes.push(i);
        }
        indexes.push(0);

        return { vertexes, indexes };
    };
}