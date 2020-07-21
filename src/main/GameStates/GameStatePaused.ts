import { Game } from "../Workers/Game";
import { DrawDirectiveText, TextAlignmentHorizontal, TextAlignmentVertical } from "../Components/Visual/DrawDirectiveText";
import { Camera } from "../Workers/CameraManager";
import { SoundType } from "../Models/SoundModels";
import { Audio } from "../Workers/SoundPlayer";
import { SoundDefinitions } from "../AssetDefinitions/SoundDefinitions";
import { UiEntityBase } from "../Entities/EntityBase";
import { GameStateBase } from "./GameStateBase";

export class GameStatePaused extends GameStateBase {
    temp: UiEntityBase | undefined = undefined;

    OnActivated(): void {
        Audio.SetTagVolume(SoundType.Music, 0.5);
        Audio.PlaySound(SoundDefinitions.ui);

        this.temp = new UiEntityBase();
        this.temp.transform.Position = Camera.Transform.Position;
        const t = new DrawDirectiveText(this.temp, 20, 'PAUSED', TextAlignmentHorizontal.Center, TextAlignmentVertical.Center);
        this.temp.AddComponent(t);
        Game.AddEntity(this.temp);

    }

    OnDeactivated(): void {
        this.temp?.Delete();
        delete this.temp;
        Audio.SetTagVolume(SoundType.Music, 1);
    }

    Update(delta: number): void {
    }
}
