import { Game } from "../Workers/Game";
import { DrawDirectiveText } from "../Components/Visual/DrawDirectiveText";
import { Camera } from "../Workers/CameraManager";
import { SoundType } from "../Models/SoundModels";
import { Audio } from "../Workers/SoundPlayer";
import { SoundDefinitions } from "../AssetDefinitions/SoundDefinitions";
import { UiEntityBase } from "../Entities/EntityBase";
import { IGameState } from "./GameStateBase";
import { HorizontalAlignment, VerticalAlignment } from "../Models/GenericInterfaces";

export class GameStatePaused implements IGameState {
    temp: UiEntityBase | undefined = undefined;

    OnActivated(): void {
        Audio.SetTagVolume(SoundType.Music, 0.5);
        Audio.PlaySound(SoundDefinitions.ui);

        this.temp = new UiEntityBase();
        this.temp.transform.Position = Camera.Transform.Position;
        const t = new DrawDirectiveText(this.temp, 20, 'PAUSED');
        t.Alignment = { horizontal: HorizontalAlignment.Middle, vertical: VerticalAlignment.Middle };
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
