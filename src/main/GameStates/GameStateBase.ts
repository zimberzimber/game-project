export interface IGameState {
    OnActivated(): void;
    OnDeactivated(): void;
    Update(delta: number): void;
}