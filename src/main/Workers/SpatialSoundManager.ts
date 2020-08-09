import { ISoundDefinition, ControllerType } from "../Models/SoundModels";
import { Camera } from "./CameraManager";
import { Audio } from "./SoundPlayer";
import { ITransformObserver, ITransformEventArgs } from "../Models/Transform";
import { LogLevel } from "./Logger";
import { Vec2 } from "../Models/Vectors";
import { Vec2Utils } from "../Utility/Vec2";
import { OneTimeLog } from "./OneTimeLogger";
import { ScalarUtil } from "../Utility/Scalar";


class SpatialSoundManager implements ITransformObserver {
    private _activeIds: number[] = []; // [2, 5, 7]
    private _soundData: { origin: Vec2; definition: ISoundDefinition; }[] = []; // [-, -, data, -, -, data, -, data]

    constructor() {
        Camera.Transform.Subscribe(this);
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        if (args.position || args.rotation)
            this.UpdateAllSoundsParams();
    }

    AddSound(soundId: number, origin: Vec2, definition: ISoundDefinition): void {
        if (!this._soundData[soundId]) {
            this._activeIds.push(soundId);
            this._soundData[soundId] = { origin: Vec2Utils.Copy(origin), definition };
            this.UpdateSoundParams(soundId);
        }
        else {
            OneTimeLog.Log(`SPATIAL_SOUND_ID_ALREADY_INDEXED_${soundId}`, `Attempted to add an already indexed spatial sound ID: ${soundId}`, LogLevel.Warn);
        }
    }

    UpdateOrigin(soundId: number, origin: Vec2): void {
        if (this._soundData[soundId]) {
            this._soundData[soundId].origin = Vec2Utils.Copy(origin);
            this.UpdateSoundParams(soundId);
        }
        else {
            OneTimeLog.Log(`UPDATE_UNINDEXED_SPATIAL_SOUND_ID_${soundId}`, `Attempted to update an unindexed spatial sound ID: ${soundId}`, LogLevel.Warn);
        }
    }

    private UpdateSoundParams(id: number): void {
        const origin = this._soundData[id].origin;
        const fd = this._soundData[id].definition.falloffDistance || 0;
        const fsd = this._soundData[id].definition.falloffStartDistance || 0;
        const d = Vec2Utils.Distance(Camera.Transform.Position, origin);

        let volumeMultiplier = 0;
        if (fd == 0 || d < fsd)
            volumeMultiplier = 1;
        else if (d >= fsd && d < fd)
            volumeMultiplier = 1 - (d - fsd) / (fd - fsd);
        Audio.SetControllerValueForSound(id, ControllerType.Volume, volumeMultiplier * this._soundData[id].definition.volume);

        let panning = 0;
        let panOrigin = origin;
        if (Camera.Transform.Rotation)
            panOrigin = Vec2Utils.RotatePointAroundCenter(origin, Camera.Transform.RotationRadian, Camera.Transform.Position);

        const e = panOrigin[0] - Camera.Transform.Position[0]
        panning = ScalarUtil.Clamp(-1, e / 200, 1);

        Audio.SetControllerValueForSound(id, ControllerType.Pan, panning);
    }

    private UpdateAllSoundsParams() {
        let deleted = false;

        for (let i = 0; i < this._activeIds.length; i++) {
            if (Audio.IsActive(this._activeIds[i]))
                this.UpdateSoundParams(this._activeIds[i]);
            else {
                delete this._soundData[this._activeIds[i]];
                delete this._activeIds[i];
                deleted = true;
            }
        }

        if (deleted)
            this._activeIds = this._activeIds.filter(id => id);
    }
}

export const SpatialSoundManagement = new SpatialSoundManager();