export abstract class GameStateBase {
    abstract OnActivated(): void;
    abstract OnDeactivated(): void;
    abstract Update(delta: number): void;
}