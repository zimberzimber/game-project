import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";
import { ISoundDefinition } from "../../Models/SoundModels";
import { Audio } from "../../Workers/SoundPlayer";
import { ITransformObserver, ITransformEventArgs } from "../../Models/Transform";
import { SoundDefinitions } from "../../AssetDefinitions/SoundDefinitions";
import { Log } from "../../Workers/Logger";
import { SpatialSoundManagement } from "../../Workers/SpatialSoundManager";

export class SoundSingleInstanceComponent extends ComponentBase implements ITransformObserver {
    private _soundDefinition: ISoundDefinition;
    private _currentSoundId: number = -1;
    private _isSpatial: boolean;

    constructor(parent: EntityBase, soundName: string, spatial: boolean) {
        super(parent);

        if (SoundDefinitions[soundName]) {
            this._soundDefinition = SoundDefinitions[soundName];

            this._isSpatial = spatial;
            if (spatial)
                this.Parent.worldRelativeTransform.Subscribe(this);
        } else
            Log.Error(`Entity ID ${this.Parent.entityId} initialized a sound component with an undefined sound: ${soundName}`);
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        if (this.Enabled && args.position && Audio.IsActive(this._currentSoundId))
            SpatialSoundManagement.UpdateOrigin(this._currentSoundId, this.Parent.worldRelativeTransform.Position);
    }

    Play(): void {
        if (!this.Enabled) return;

        if (Audio.IsActive(this._currentSoundId))
            Audio.RestartSound(this._currentSoundId);
        else {
            this._currentSoundId = Audio.PlaySound(this._soundDefinition);
            if (this._isSpatial)
                SpatialSoundManagement.AddSound(this._currentSoundId, this.Parent.worldRelativeTransform.Position, this._soundDefinition);
        }
    }

    Stop(): void {
        if (Audio.IsActive(this._currentSoundId))
            Audio.StopSound(this._currentSoundId);
    }

    FadeOut(time: number): void {
        if (!this.Enabled) return;

        if (Audio.IsActive(this._currentSoundId))
            Audio.FadeVolumeForSound(this._currentSoundId, 0, time);
    }

    FadeIn(time: number): void {
        if (!this.Enabled) return;

        if (!Audio.IsActive(this._currentSoundId))
            this.Play();
        Audio.FadeVolumeForSound(this._currentSoundId, 1, time);
    }

    OnDisabled(): void {
        this.Stop();
    }

    Unitialize(): void {
        if (Audio.IsActive(this._currentSoundId) && Audio.GetLooping(this._currentSoundId))
            Audio.SetLooping(this._currentSoundId, false);
        this.Parent.worldRelativeTransform.Unsubscribe(this);
        super.Unitialize();
    }
}