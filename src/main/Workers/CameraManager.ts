import { Vec2 } from "../Models/Vec2";
import { Webgl } from "./WebglManager";
import { Transform } from "../Models/Transform";

class CameraManager {
    readonly Transform: Transform = new Transform();
    private _nearFar: Vec2 = [0.1, 1000];

    constructor() {
        this.Transform.onChanged = () => {
            Webgl.SetCameraTranslation(this.Transform.Position[0], this.Transform.Position[1]);
            Webgl.SetCameraRotation(this.Transform.Rotation);
            Webgl.SetCameraFrustum(this.Transform.Scale[0], this.Transform.Scale[1], this._nearFar[0], this._nearFar[1]);
        };
    }

    set NearFar(nearFar: Vec2) {
        this._nearFar = nearFar;
        Webgl.SetCameraFrustum(this.Transform.Scale[0], this.Transform.Scale[1], this._nearFar[0], this._nearFar[1]);
    }

    get NearFar() { return this._nearFar; }
}

export const Camera = new CameraManager;