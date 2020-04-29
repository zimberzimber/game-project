
/** Only observes mapped keys, and accept the name mapped to the key code. */
export interface IInputObserver {
    OnKeyDown(key: string): void;
    OnKeyUp(key: string): void;
}

/** Observes and receives all keyboard events. Useful for rebinding and writing text. */
export interface IFullInputObserver {
    OnKeyDown(event: KeyboardEvent): void;
    OnKeyUp(event: KeyboardEvent): void;
}