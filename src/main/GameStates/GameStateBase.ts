export interface IGameState {
    OnActivated(args?: any): void;
    OnDeactivated(): void;
    Update(delta: number): void;
}