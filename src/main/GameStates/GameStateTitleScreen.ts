import { IGameState } from "./GameStateBase";
import { TitleScreenUi } from "../Entities/Ui/Premade/MainMenu";
import { Game } from "../Workers/Game";

export class GameStateTitleScreen implements IGameState {
    private main: TitleScreenUi;

    OnActivated(): void {
        this.main = new TitleScreenUi(null, [600, 500]);
        Game.AddEntity(this.main);
    }
    OnDeactivated(): void {
        Game.RemoveEntity(this.main);
        delete this.main;
    }
    Update(delta: number): void {
        this.main.Update(delta);
    }
}