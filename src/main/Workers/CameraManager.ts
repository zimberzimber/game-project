import { Vec2 } from "../Models/Vectors";
import { Transform, ITransformObserver, ITransformEventArgs } from "../Models/Transform";
import { Vec2Utils } from "../Utility/Vec2";
import { IsPointInPolygon } from "./CollisionChecker";

class CameraManager implements ITransformObserver {
    readonly Transform: Transform = new Transform();

    private _nearFar: Vec2 = [0.1, 1000];
    get NearFar() { return this._nearFar; }
    set NearFar(nearFar: Vec2) { this._nearFar = nearFar; }

    private _viewPolyline: Vec2[] = [];
    get ViewPolyline(): Vec2[] { return this._viewPolyline }

    constructor() {
        this.Transform.Subscribe(this);
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        const tp = this.Transform.Position;
        const ts = this.Transform.Scale;
        this._viewPolyline = [
            Vec2Utils.RotatePointAroundCenter([tp[0] + ts[0] / 2, tp[1] + ts[1] / 2], -this.Transform.RotationRadian, tp),
            Vec2Utils.RotatePointAroundCenter([tp[0] - ts[0] / 2, tp[1] + ts[1] / 2], -this.Transform.RotationRadian, tp),
            Vec2Utils.RotatePointAroundCenter([tp[0] - ts[0] / 2, tp[1] - ts[1] / 2], -this.Transform.RotationRadian, tp),
            Vec2Utils.RotatePointAroundCenter([tp[0] + ts[0] / 2, tp[1] - ts[1] / 2], -this.Transform.RotationRadian, tp),
        ];
    }

    IsInView(point: Vec2, radius: number): boolean {
        return IsPointInPolygon(Vec2Utils.MoveTowards(point, this.Transform.Position, radius, false), this.ViewPolyline);
    }
}

export const Camera = new CameraManager;