import { Observable, IObserver } from "./Observable";

const buttonPressThreshold = 0.3; // From what value is the button considered pressed. (Only relevant to a few keys, most go from 0 to 1)
const axisDifferenceThreshold = 0.05; // In what increments should axis differences be taken into account, as to prevent a wet fart from creating a gazillion redundant updates

// interface IGamepadButtonState {
//     pressed: boolean;
//     value: number;
// }

export enum GamepadAxis {
    leftX, leftY,
    rightX, rightY
}

interface IGamepadEvent {
    gamepadId: number;
}

export interface IGamepadAxisEvent extends IGamepadEvent {
    axis: GamepadAxis;
    oldValue: number;
    newValue: number;
}

export interface IGamepadButtonEvent extends IGamepadEvent {
    buttonId: number;
    isDown: boolean;
}

export interface IGamepadObserver extends IObserver<IGamepadEvent> {
    OnObservableNotified(args: IGamepadEvent): void;
}

export class GamepadContainer extends Observable<IGamepadObserver, IGamepadEvent> {
    private _axes: number[] = [0, 0, 0, 0];
    private _buttons: boolean[] = [];
    private _origRef: Gamepad;
    private _lastTimeStamp: number;
    private _isConnected: boolean;

    readonly AxisObservable = new Observable<IGamepadObserver, IGamepadAxisEvent>();
    readonly ButtonObservable = new Observable<IGamepadObserver, IGamepadButtonEvent>();

    get IsConnected(): boolean { return this._isConnected; }

    constructor(gamepad: Gamepad) {
        super();

        this._origRef = gamepad;
        this._lastTimeStamp = gamepad.timestamp;
        this._isConnected = gamepad.connected;

        for (const b of gamepad.buttons) {
            // this._buttons.push({
            //     value: b.value,
            //     pressed: b.value >= pressThreshold,
            // });
            this._buttons.push(b.value >= buttonPressThreshold);
        }
    }

    // Reset the state and notify observers
    private ResetState(): void {
        for (let i = 0; i < this._axes.length; i++) {
            const old = this._axes[i];
            this._axes[i] = 0;
            this.AxisObservable.Notify({ gamepadId: this._origRef.index, oldValue: old, newValue: 0, axis: GamepadAxis[GamepadAxis[i]] });
        }

        for (let i = 0; i < this._buttons.length; i++) {
            this._buttons[i] = false;
            this.ButtonObservable.Notify({ gamepadId: this._origRef.index, buttonId: i, isDown: false })
        }

        // Setting to -1 makes sure the state updates should the gamepad reconnect
        this._lastTimeStamp = -1;
    }

    Update() {
        if (!this._origRef.connected) {
            if (this._isConnected) {
                this.ResetState();
                this._isConnected = false;
            }
            return;
        }

        if (this._lastTimeStamp == this._origRef.timestamp) return;

        for (let i = 0; i < this._axes.length; i++) {
            // Only account for differences of 'axisDifferenceThreshold' instead of every micro-movement
            const na = this._origRef.axes[i] - (this._origRef.axes[i] % axisDifferenceThreshold);
            const oa = this._axes[i];

            if (oa != na) {
                this._axes[i] = na;
                this.AxisObservable.Notify({ gamepadId: this._origRef.index, oldValue: oa, newValue: na, axis: GamepadAxis[GamepadAxis[i]] });
            }
        }

        for (let i = 0; i < this._buttons.length; i++) {
            const ob = this._buttons[i];
            const nb = this._origRef.buttons[i].value >= buttonPressThreshold;
            if (ob != nb) {
                this._buttons[i] = nb
                this.ButtonObservable.Notify({ gamepadId: this._origRef.index, buttonId: i, isDown: nb })
            }
        }
    }

    GetAxisValue(axis: GamepadAxis): number {
        return this._axes[axis];
    }

    IsButtonDown(buttonId: number): boolean {
        return this._buttons[buttonId];
    }

    IsContainerFor(gamepad: Gamepad): boolean {
        return gamepad == this._origRef;
    }

    Terminate(): void {
        this.ResetState();
        this.AxisObservable.UnsubscribeAll();
        this.ButtonObservable.UnsubscribeAll();
        delete this._origRef;
    }
}