import { Vec2 } from "../Models/Vectors";
import { Transform } from "../Models/Transform";
import { Observable, IObserver } from "../Models/Observable";
import { Vec2Utils } from "../Utility/Vec2";

export interface ICameraObserver extends IObserver<ICameraEventArgs> {
    OnObservableNotified(args: ICameraEventArgs): void;
}

export interface ICameraEventArgs {
    transform: Transform;
    nearFar: Vec2;
}

class CameraManager extends Observable<ICameraObserver, ICameraEventArgs> {
    readonly Transform: Transform = new Transform();

    private _nearFar: Vec2 = [0.1, 1000];
    get NearFar() { return this._nearFar; }
    set NearFar(nearFar: Vec2) { this._nearFar = nearFar; }

    private _viewPolyline: Vec2[] = [];
    get ViewPolyline(): Vec2[] { return this._viewPolyline }

    constructor() {
        super();
        this.Transform.onChanged = this.OnUpdated.bind(this);
    }

    private OnUpdated(): void {
        const tp = this.Transform.Position
        const ts = this.Transform.Scale
        this._viewPolyline = [
            Vec2Utils.RotatePointAroundCenter([tp[0] + ts[0] / 2, tp[1] + ts[1] / 2], -this.Transform.RotationRadian, tp),
            Vec2Utils.RotatePointAroundCenter([tp[0] - ts[0] / 2, tp[1] + ts[1] / 2], -this.Transform.RotationRadian, tp),
            Vec2Utils.RotatePointAroundCenter([tp[0] - ts[0] / 2, tp[1] - ts[1] / 2], -this.Transform.RotationRadian, tp),
            Vec2Utils.RotatePointAroundCenter([tp[0] + ts[0] / 2, tp[1] - ts[1] / 2], -this.Transform.RotationRadian, tp),
        ]
        this.Notify({ transform: this.Transform, nearFar: this._nearFar });
    }

    ManualUpdate(): void {
        this.OnUpdated();
    }
}

export const Camera = new CameraManager;