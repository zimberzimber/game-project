import { IObserver } from "./Observable";

export enum GlobalDataFields {
    Score, Health, MaxHealth, Energy, MaxEnergy, PlayerEntity
}

export interface IGlobalGameDataObserver extends IObserver<IGlobalGameDataEventArgs> {
    OnObservableNotified(args: IGlobalGameDataEventArgs): void;
}

export interface IGlobalGameDataEventArgs {
    oldValue: any;
    newValue: any;
}