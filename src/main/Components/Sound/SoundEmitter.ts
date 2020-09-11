import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";
import { ISoundDefinition } from "../../Models/SoundModels";
import { Audio } from "../../Workers/SoundPlayer";
import { SoundDefinitions } from "../../AssetDefinitions/SoundDefinitions";
import { Log } from "../../Workers/Logger";
import { SpatialSoundManagement } from "../../Workers/SpatialSoundManager";

export class SoundEmitterComponent extends ComponentBase {
    private _soundDefinition: ISoundDefinition;
    private _isSpatial: boolean;

    set EmittedSound(soundName: string) {
        if (SoundDefinitions[soundName])
            this._soundDefinition = SoundDefinitions[soundName];
        else
            Log.Error(`Entity ID ${this.Parent.EntityId} initialized a sound component with an undefined sound: ${soundName}`);
    }

    constructor(parent: EntityBase, soundName: string, spatialEmission: boolean) {
        super(parent);
        this.EmittedSound = soundName;
        this._isSpatial = spatialEmission;
    }

    Emit(): void {
        if (this.Enabled && this._soundDefinition) {
            const soundId = Audio.PlaySound(this._soundDefinition);

            if (this._isSpatial)
                SpatialSoundManagement.AddSound(soundId, this.Parent.WorldRelativeTransform.Position, this._soundDefinition);
        }
    }
}


