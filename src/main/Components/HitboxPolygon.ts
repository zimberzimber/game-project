import { Vec2 } from "../Models/Vec2";
import { Util } from "../Utility";
import { HitboxBase } from "../Bases/HitboxBase";
import { HitboxType } from "../Models/HitboxType";
import { EntityBase } from "../Bases/EntityBase";
import { TriggerState } from "../Models/TriggerState";

export class HitboxPolygon extends HitboxBase {
    HitboxType: HitboxType = HitboxType.Polygonal;
    private Polyline: Vec2[];

    constructor(parent: EntityBase, ...points: Vec2[]) {
        super(parent);
        this.Polyline = points;
        this.CalculateOverallHitboxRadius();
    }

    protected CalculateOverallHitboxRadius() {
        this.Polyline.map(p => {
            let distance = Util.GetDistanceFrom00(p);
            if (distance > this.HitboxOverallRadius)
                this.HitboxOverallRadius = distance;
        });
    }

    GetCanvasReletivePolyline(): Vec2[] {
        const polyline: Vec2[] = [];
        const radian = this.parent.transform.GetRotationRadian();

        if (radian == 0)
            for (let i = 0; i < this.Polyline.length; i++)
                polyline[i] = Vec2.SumVectors(this.parent.transform.position, this.Polyline[i]);

        else
            for (let i = 0; i < this.Polyline.length; i++)
                polyline[i] = Vec2.SumVectors(this.parent.transform.position, Util.RotatePoint(this.Polyline[i], radian));

        return polyline;
    }

    DrawHitbox(context: any): void {
        if (!this.CollisionEnabled) return;
        if (this.Polyline.length < 2) return;

        const polyline = this.GetCanvasReletivePolyline();

        context.strokeStyle = this.GetTriggerState() != TriggerState.NotTrigger ? HitboxBase.DebugHitboxColor : HitboxBase.DebugTriggerColor
        context.beginPath();
        context.moveTo(polyline[0].x, polyline[0].y);

        for (let i = 1; i <= polyline.length; i++) {
            const point = polyline[i % polyline.length];
            context.lineTo(point.x, point.y);
        }

        context.stroke();
    }
}