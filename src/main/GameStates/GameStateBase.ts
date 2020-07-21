import { GameStateGame } from "./GameStateGame";
import { GameStatePaused } from "./GameStatePaused";
import { GameStateMainMenu } from "./GameStateMainMenu";
import { GameStateIntro } from "./GameStateIntro";

export abstract class GameStateBase {
    abstract OnActivated(): void;
    abstract OnDeactivated(): void;
    abstract Update(delta: number): void;
}

export const GameStateDictionary = {
    Game: new GameStateGame(),
    Paused: new GameStatePaused(),
}