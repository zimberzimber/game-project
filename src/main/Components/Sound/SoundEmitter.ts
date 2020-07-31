import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";
import { ISoundDefinition, SoundType } from "../../Models/SoundModels";
import { Audio } from "../../Workers/SoundPlayer";
import { SoundDefinitions } from "../../AssetDefinitions/SoundDefinitions";
import { Log } from "../../Workers/Logger";
import { SpatialSoundManagement } from "../../Workers/SpatialSoundManager";

export class SoundEmitterComponent extends ComponentBase {
    private _soundDefinition: ISoundDefinition;

    set EmittedSound(soundName: string) {
        if (SoundDefinitions[soundName])
            this._soundDefinition = SoundDefinitions[soundName];
        else
            Log.Error(`Entity ID ${this.Parent.entityId} initialized a sound component with an undefined sound: ${soundName}`);
    }

    constructor(parent: EntityBase, soundName: string) {
        super(parent);
        this.EmittedSound = soundName;
    }

    Emit(): void {
        if (this.Enabled && this._soundDefinition) {
            const soundId = Audio.PlaySound(this._soundDefinition);

            // Only default sounds are spatial
            if (this._soundDefinition.type == SoundType.Default)
                SpatialSoundManagement.AddSound(soundId, this.Parent.worldRelativeTransform.Position, this._soundDefinition);
        }
    }
}


