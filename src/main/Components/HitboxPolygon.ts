import Vec2 from "../Models/Vec2";
import { HitboxBase } from "../Bases/HitboxBase";
import { HitboxType } from "../Models/HitboxType";
import { EntityBase } from "../Bases/EntityBase";
import { TriggerState } from "../Models/TriggerState";
import Vec2Utils from "../Utility/Vec2";
import { WebglDrawData } from "../Models/WebglDrawData";

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
        const polyline: Vec2[] = [];
        const radian = this.parent.transform.GetRotationRadian();

        if (radian == 0)
            for (let i = 0; i < this.Polyline.length; i++)
                polyline[i] = Vec2Utils.Sum(this.parent.transform.position, this.Polyline[i]);
        else
            for (let i = 0; i < this.Polyline.length; i++)
                polyline[i] = Vec2Utils.Sum(this.parent.transform.position, Vec2Utils.RotatePoint(this.Polyline[i], radian));

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

    DrawHitbox(context: any): void {
        if (!this.CollisionEnabled) return;
        if (this.Polyline.length < 2) return;

        const polyline = this.GetCanvasReletivePolyline();

        context.strokeStyle = this.GetTriggerState() != TriggerState.NotTrigger ? HitboxBase.DebugHitboxColor : HitboxBase.DebugTriggerColor
        context.beginPath();
        context.moveTo(polyline[0][0], polyline[0][1]);

        for (let i = 1; i <= polyline.length; i++) {
            const point = polyline[i % polyline.length];
            context.lineTo(point[0], point[1]);
        }

        context.stroke();
    }
}