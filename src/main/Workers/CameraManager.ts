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

    GetCameraRelativePanningAndVolume(soundOrigin: Vec2, falloffStartDistance: number, falloffDistance: number): { panning: number, volumeMultiplier: number } {
        let result = { panning: 0, volumeMultiplier: 0 };

        const d = Vec2Utils.Distance(this.Transform.Position, soundOrigin);
        if (falloffDistance == 0 || d < falloffStartDistance)
            result.volumeMultiplier = 1;
        else if (d >= falloffStartDistance && d < falloffDistance)
            result.volumeMultiplier = 1 - (d - falloffStartDistance) / (falloffDistance - falloffStartDistance);

        if (d > 50){
            const p2 = Vec2Utils.MoveTowards(this.Transform.Position, soundOrigin, 50, false);
            const angle = Vec2Utils.GetAngle(p2, soundOrigin) + this.Transform.Rotation;
            result.panning = 1 - Math.abs(angle) / 90;
        }

        return result;
    }

    IsInView(point: Vec2, radius: number): boolean {
        return IsPointInPolygon(Vec2Utils.MoveTowards(point, this.Transform.Position, radius, false), this.ViewPolyline);
    }
}

export const Camera = new CameraManager;