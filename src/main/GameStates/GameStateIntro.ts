import { IGameState } from "./GameStateBase";

export class GameStateIntro implements IGameState {
    OnActivated(): void {
        throw new Error("Method not implemented.");
    }
    OnDeactivated(): void {
        throw new Error("Method not implemented.");
    }
    Update(delta: number): void {
        throw new Error("Method not implemented.");
    }

}
