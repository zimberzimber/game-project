import { IObserver } from "./Observable";
import { Vec2 } from "./Vectors";
import { ControlKey } from "./ControlKeys";

export enum ButtonState { Down, Up }
export enum MouseButton { M1 = 0, Wheel = 1, M2 = 2 }

export interface IMouseEvent {
    state: ButtonState;
    button: MouseButton;
    position: Vec2;
}

export interface IKeyboardEvent {
    state: ButtonState;
    key: ControlKey;
}

export interface IMouseObserver extends IObserver<IMouseEvent> {
    OnObservableNotified(args: IMouseEvent): void;
}

export interface IKeyboardObserver extends IObserver<IKeyboardEvent> {
    OnObservableNotified(args: IKeyboardEvent): void;
}

export interface IMouseObserverFull extends IObserver<MouseEvent> {
    OnObservableNotified(args: MouseEvent): void;
}

export interface IKeyboardObserverFull extends IObserver<KeyboardEvent> {
    OnObservableNotified(args: KeyboardEvent): void;
}