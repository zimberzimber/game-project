import { IObserver } from "./Observable";
import { Vec2 } from "./Vectors";

export enum ButtonState { Down, Up }

export interface IMouseEvent {
    state: ButtonState;
    button: number;
    position: Vec2;
}

export interface IKeyboardEvent {
    state: ButtonState;
    keyName: string;
}

export interface IMouseObserver extends IObserver<IMouseEvent>{
    OnObservableNotified(args: IMouseEvent): void;
}

export interface IKeyboardObserver extends IObserver<IKeyboardEvent>{
    OnObservableNotified(args: IKeyboardEvent): void;
}

export class MouseObserverFull implements IObserver<MouseEvent>{
    OnObservableNotified(args: MouseEvent): void { }
}

export class KeyboardObserverFull implements IObserver<KeyboardEvent>{
    OnObservableNotified(args: KeyboardEvent): void { }
}