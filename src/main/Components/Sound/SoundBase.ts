import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";
import { ISoundDefinition, ControllerType } from "../../Models/SoundModels";
import { Camera } from "../../Workers/CameraManager";
import { Audio } from "../../Workers/SoundPlayer";
import { ITransformObserver, ITransformEventArgs } from "../../Models/Transform";
import { SoundDefinitions } from "../../AssetDefinitions/SoundDefinitions";
import { Log } from "../../Workers/Logger";

export class SoundComponent extends ComponentBase implements ITransformObserver {
    private soundDefinition: ISoundDefinition;
    private currentSoundId: number = -1;

    constructor(parent: EntityBase, soundName: string) {
        super(parent);

        if (SoundDefinitions[soundName]) {
            this.soundDefinition = SoundDefinitions[soundName];
            Camera.Transform.Subscribe(this);
        } else {
            Log.Error(`Entity ID ${this.Parent.entityId} initialized a sound component with an undefined sound: ${soundName}`);
        }
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        if (!this.Enabled) return;

        if (Audio.IsActive(this.currentSoundId)) {
            const params = Camera.GetCameraRelativePanningAndVolume(this.Parent.worldRelativeTransform.Position, this.soundDefinition.falloffStartDistance, this.soundDefinition.falloffDistance);

            Audio.SetControllerValueForSound(this.currentSoundId, ControllerType.Pan, params.panning);
            Audio.SetControllerValueForSound(this.currentSoundId, ControllerType.Volume, params.volumeMultiplier * this.soundDefinition.volume);
        }
    }

    Play(): void {
        if (!this.Enabled) return;

        if (Audio.IsActive(this.currentSoundId)) {
            Audio.RestartSound(this.currentSoundId);
        }
        else {
            this.currentSoundId = Audio.PlaySound(this.soundDefinition);
        }
    }

    Stop(): void {
        if (!this.Enabled) return;

        if (Audio.IsActive(this.currentSoundId))
            Audio.StopSound(this.currentSoundId);
    }

    FadeOut(time: number): void {
        if (!this.Enabled) return;

        if (Audio.IsActive(this.currentSoundId))
            Audio.FadeVolumeForSound(this.currentSoundId, 0, time);
    }

    FadeIn(time: number): void {
        if (!this.Enabled) return;

        if (!Audio.IsActive(this.currentSoundId))
            this.Play();
        Audio.FadeVolumeForSound(this.currentSoundId, 1, time);
    }

    OnDisabled(): void {
        this.Stop();
    }

    Unitialize(): void {
        super.Unitialize();
        if (Audio.IsActive(this.currentSoundId) && Audio.GetLooping(this.currentSoundId))
            Audio.SetLooping(this.currentSoundId, false);
        Camera.Transform.Unsubscribe(this);
    }
}
