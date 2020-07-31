import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";
import { ISoundDefinition, SoundType } from "../../Models/SoundModels";
import { Audio } from "../../Workers/SoundPlayer";
import { ITransformObserver, ITransformEventArgs } from "../../Models/Transform";
import { SoundDefinitions } from "../../AssetDefinitions/SoundDefinitions";
import { Log } from "../../Workers/Logger";
import { SpatialSoundManagement } from "../../Workers/SpatialSoundManager";

export class SoundSingleInstanceComponent extends ComponentBase implements ITransformObserver {
    private _soundDefinition: ISoundDefinition;
    private _currentSoundId: number = -1;

    constructor(parent: EntityBase, soundName: string) {
        super(parent);

        if (SoundDefinitions[soundName]) {
            this._soundDefinition = SoundDefinitions[soundName];

            // Only default type is spatial
            if (this._soundDefinition.type == SoundType.Default)
                this.Parent.worldRelativeTransform.Subscribe(this);
        } else
            Log.Error(`Entity ID ${this.Parent.entityId} initialized a sound component with an undefined sound: ${soundName}`);
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        // No need to check whether the sound is of type Default since the compotent doesn't subscribe to parents transform otherwise
        if (this.Enabled && args.position && Audio.IsActive(this._currentSoundId))
            SpatialSoundManagement.UpdateOrigin(this._currentSoundId, this.Parent.worldRelativeTransform.Position);
    }

    Play(): void {
        if (!this.Enabled) return;

        if (Audio.IsActive(this._currentSoundId))
            Audio.RestartSound(this._currentSoundId);
        else {
            this._currentSoundId = Audio.PlaySound(this._soundDefinition);
            // Only default sounds are spatial
            if (this._soundDefinition.type == SoundType.Default)
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
