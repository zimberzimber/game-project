import { Vec2 } from "./Vec2";

/** Only observes mapped keys, and accept the name mapped to the key code. */
export interface IKeyboardInputObserver {
    OnKeyDown(key: string): void;
    OnKeyUp(key: string): void;
}

/** Observes and receives all keyboard events. Useful for rebinding and writing text. */
export interface IKeyboardFullInputObserver {
    OnKeyDown(event: KeyboardEvent): void;
    OnKeyUp(event: KeyboardEvent): void;
}

export interface IMouseInputObserver {
    OnMouseDown(button: number, position: Vec2): void;
    OnMouseUp(button: number, position: Vec2): void;
}

export interface IMouseFullInputObserver {
    OnMouseDown(event: MouseEvent): void;
    OnMouseUp(event: MouseEvent): void;
}