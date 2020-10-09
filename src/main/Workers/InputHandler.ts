import { IMouseObserver, IMouseEvent, IKeyboardObserver, IKeyboardEvent, IMouseObserverFull, IKeyboardObserverFull, ButtonState } from "../Models/InputModels";
import { Vec2 } from "../Models/Vectors";
import { Observable } from "../Models/Observable";
import { KeymapContainer, IKeymap, ControlKey } from "../Models/ControlKeys";
import { GamepadContainer, IGamepadObserver, IGamepadAxisEvent, IGamepadButtonEvent, GamepadAxis } from "../Models/Controller";
import { Camera } from "./CameraManager";
import { Settings } from "./SettingsManager";
import { ISettingsEventArgs, UserSetting } from "../Models/IUserSettings";

const GamepadButtonKeymap = {
    0: ControlKey.action1,
    1: ControlKey.action2,
    2: ControlKey.action3,
    3: ControlKey.action4,
    9: ControlKey.pause,
}

const GamepadAxisKeymap = {
    [GamepadAxis.leftX]: { min: ControlKey.left, max: ControlKey.right },
    [GamepadAxis.leftY]: { min: ControlKey.up, max: ControlKey.down },
}

// From what point will a key tied to an axis will count as down
const axisKeyThreshold = 0.1;

class GamepadToKeys {
    // No reason to keep more than one, shits single player yo (*maybe* I'll add co-op. maybe.)
    private _gamepad: GamepadContainer | undefined;
    private _axisDown: Vec2 = [0, 0];

    // Can't wait for someone to tell me how ugly this is
    private _axisObserver: IGamepadObserver = {
        OnObservableNotified: (args: IGamepadAxisEvent) => {
            if (args.axis == GamepadAxis.leftX) {
                const oldAxisDown = this._axisDown[0];

                if (args.newValue >= axisKeyThreshold) {
                    if (oldAxisDown != 1) { // Is it not pressed? (i.e -1 or 0)
                        this._axisDown[0] = 1; // It is now

                        // simulate opposite button unclick if required
                        if (oldAxisDown == -1) {
                            const ok = Input.GetCharcodeForKey(GamepadAxisKeymap[GamepadAxis.leftX].min);
                            if (ok !== null) Input.SimulateKey(ok, false);
                        }

                        // Get the keycode, and simulate it if its valid
                        const nk = Input.GetCharcodeForKey(GamepadAxisKeymap[GamepadAxis.leftX].max);
                        if (nk !== null) Input.SimulateKey(nk, true);
                    }
                } else if (args.newValue <= -axisKeyThreshold) {
                    if (oldAxisDown != -1) { // Is it not pressed? (i.e 1 or 0)
                        this._axisDown[0] = -1; // It is now

                        // simulate opposite button unclick if required
                        if (oldAxisDown == 1) {
                            const ok = Input.GetCharcodeForKey(GamepadAxisKeymap[GamepadAxis.leftX].max);
                            if (ok !== null) Input.SimulateKey(ok, false);
                        }

                        // Get the keycode, and simulate it if its valid
                        const nk = Input.GetCharcodeForKey(GamepadAxisKeymap[GamepadAxis.leftX].min);
                        if (nk !== null) Input.SimulateKey(nk, true);
                    }
                } else {
                    this._axisDown[0] = 0;
                    if (oldAxisDown == 1) {
                        const ok = Input.GetCharcodeForKey(GamepadAxisKeymap[GamepadAxis.leftX].max);
                        if (ok !== null) Input.SimulateKey(ok, false);
                    } else if (oldAxisDown == -1) {
                        const ok = Input.GetCharcodeForKey(GamepadAxisKeymap[GamepadAxis.leftX].min);
                        if (ok !== null) Input.SimulateKey(ok, false);
                    }
                }
            } else if (args.axis == GamepadAxis.leftY) {
                const oldAxisDown = this._axisDown[1];

                if (args.newValue >= axisKeyThreshold) {
                    if (oldAxisDown != 1) { // Is it not pressed? (i.e -1 or 0)
                        this._axisDown[1] = 1; // It is now

                        // simulate opposite button unclick if required
                        if (oldAxisDown == -1) {
                            const ok = Input.GetCharcodeForKey(GamepadAxisKeymap[GamepadAxis.leftY].min);
                            if (ok !== null) Input.SimulateKey(ok, false);
                        }

                        // Get the keycode, and simulate it if its valid
                        const nk = Input.GetCharcodeForKey(GamepadAxisKeymap[GamepadAxis.leftY].max);
                        if (nk !== null) Input.SimulateKey(nk, true);
                    }
                } else if (args.newValue <= -axisKeyThreshold) {
                    if (oldAxisDown != -1) { // Is it not pressed? (i.e 1 or 0)
                        this._axisDown[1] = -1; // It is now

                        // simulate opposite button unclick if required
                        if (oldAxisDown == 1) {
                            const ok = Input.GetCharcodeForKey(GamepadAxisKeymap[GamepadAxis.leftY].max);
                            if (ok !== null) Input.SimulateKey(ok, false);
                        }

                        // Get the keycode, and simulate it if its valid
                        const nk = Input.GetCharcodeForKey(GamepadAxisKeymap[GamepadAxis.leftY].min);
                        if (nk !== null) Input.SimulateKey(nk, true);
                    }
                } else {
                    this._axisDown[1] = 0;
                    if (oldAxisDown == 1) {
                        const ok = Input.GetCharcodeForKey(GamepadAxisKeymap[GamepadAxis.leftY].max);
                        if (ok !== null) Input.SimulateKey(ok, false);
                    } else if (oldAxisDown == -1) {
                        const ok = Input.GetCharcodeForKey(GamepadAxisKeymap[GamepadAxis.leftY].min);
                        if (ok !== null) Input.SimulateKey(ok, false);
                    }
                }
            }
        }
    };

    private _buttonObserver: IGamepadObserver = {
        OnObservableNotified: (args: IGamepadButtonEvent) => {
            const ok = Input.GetCharcodeForKey(GamepadButtonKeymap[args.buttonId]);
            if (ok !== null) Input.SimulateKey(ok, args.isDown);
        }
    };

    constructor() {
        window.addEventListener("gamepadconnected", this.ObtainGamepads.bind(this));
        window.addEventListener("gamepaddisconnected", this.ObtainGamepads.bind(this));
    }

    private SetGamepad(gamepad: Gamepad): void {
        this._gamepad = new GamepadContainer(gamepad);
        this._gamepad.AxisObservable.Subscribe(this._axisObserver);
        this._gamepad.ButtonObservable.Subscribe(this._buttonObserver);
    }

    private ObtainGamepads(): void {
        const gamepads = navigator.getGamepads();
        if (gamepads[0]) {
            if (!this._gamepad) {
                this.SetGamepad(gamepads[0]);
            } else if (!this._gamepad.IsContainerFor(gamepads[0])) {
                this._gamepad.Terminate();
                this.SetGamepad(gamepads[0]);
            }
        }
    }

    Update(): void {
        this._gamepad?.Update();
    }
}

class InputHandler {
    readonly MouseObservable: Observable<IMouseObserver, IMouseEvent> = new Observable<IMouseObserver, IMouseEvent>();
    readonly KeyboardObservable: Observable<IKeyboardObserver, IKeyboardEvent> = new Observable<IKeyboardObserver, IKeyboardEvent>();
    readonly MouseFullObservable: Observable<IMouseObserverFull, MouseEvent> = new Observable<IMouseObserverFull, MouseEvent>();
    readonly KeyboardFullObservable: Observable<IKeyboardObserverFull, KeyboardEvent> = new Observable<IKeyboardObserverFull, KeyboardEvent>();

    private _mousePosition: Vec2 = [Number.MIN_SAFE_INTEGER, Number.MIN_SAFE_INTEGER];
    get MousePosition(): Vec2 { return [this._mousePosition[0], this._mousePosition[1]]; }

    private _keysDown: { [key: string]: boolean } = {};
    private _keymapContainer: KeymapContainer;

    GetCharcodeForKey(key: ControlKey): string | null {
        return this._keymapContainer.GetCharcodeForKey(key);
    }
    GetKeyForCharcode(code: string): number | null {
        return this._keymapContainer.GetKeyForCharcode(code);
    }

    private _mouseElement: HTMLElement | undefined = undefined;
    private _mouseElementBindingbox: DOMRect | undefined = undefined;
    set MouseElement(element: HTMLElement) {
        this._mouseElement?.removeEventListener('mousedown', this.OnMouseDown.bind(this));
        this._mouseElement?.removeEventListener('mouseup', this.OnMouseUp.bind(this));
        this._mouseElement?.removeEventListener('mousemove', this.OnMouseMove.bind(this));
        this._mouseElement?.removeEventListener('resize', this.OnMouseElementResize.bind(this));

        this._mouseElement = element;
        this._mouseElementBindingbox = element.getBoundingClientRect();
        this._mouseElement.addEventListener('mousedown', this.OnMouseDown.bind(this));
        this._mouseElement.addEventListener('mouseup', this.OnMouseUp.bind(this));
        this._mouseElement.addEventListener('mousemove', this.OnMouseMove.bind(this));
        this._mouseElement.addEventListener('resize', this.OnMouseElementResize.bind(this));
    }

    constructor() {
        window.addEventListener('keydown', this.OnKeyDown.bind(this));
        window.addEventListener('keyup', this.OnKeyUp.bind(this));

        // Resizing the window changes the elements binding box
        // Anything that alters the elements actual position does, but I'm only taking the window into account since it shouldn't move otherwise
        window.addEventListener('resize', () => {
            if (this._mouseElement)
                this._mouseElementBindingbox = this._mouseElement.getBoundingClientRect();
        })

        this._keymapContainer = new KeymapContainer(Settings.GetSetting(UserSetting.ControlsKeymap));
        Settings.Observable.Subscribe({
            OnObservableNotified(args: ISettingsEventArgs): void {
                if (args.setting == UserSetting.ControlsKeymap)
                    Input._keymapContainer = new KeymapContainer(args.newValue);
            }
        })
    }

    SimulateKey(key: string, down: boolean): void {
        if (down)
            //@ts-ignore "Trust me"
            this.OnKeyDown({ key })
        else
            //@ts-ignore "Trust me"
            this.OnKeyUp({ key })
    }

    SimulateMouse(button: number, position: Vec2, down: boolean): void {
        // Don't need any checks here so notifying directly
        this.MouseObservable.Notify({ button, position, state: down ? ButtonState.Down : ButtonState.Up });
    }

    IsKeyDown(key: ControlKey): boolean {
        return this._keysDown[key];
    }

    private OnKeyDown(e: KeyboardEvent, simulated: boolean = false): void {
        if (this._keymapContainer) {
            const key = this._keymapContainer.GetKeyForCharcode(e.code);
            if (key !== null && !this._keysDown[key]) {
                this._keysDown[key] = true;
                this.KeyboardObservable.Notify({ key: key, state: ButtonState.Down });
            }
        }

        if (!simulated)
            this.KeyboardFullObservable.Notify(e);
    }

    private OnKeyUp(e: KeyboardEvent, simulated: boolean = false): void {
        if (this._keymapContainer) {
            const key = this._keymapContainer.GetKeyForCharcode(e.code);
            if (key !== null && this._keysDown[key]) {
                delete this._keysDown[key];
                this.KeyboardObservable.Notify({ key: key, state: ButtonState.Up });
            }
        }

        if (!simulated)
            this.KeyboardFullObservable.Notify(e);
    }

    private OnMouseDown(e: MouseEvent): void {
        this.MouseObservable.Notify({ button: e.button, position: this.MousePosition, state: ButtonState.Down });
        this.MouseFullObservable.Notify(e);
    }

    private OnMouseUp(e: MouseEvent): void {
        this.MouseObservable.Notify({ button: e.button, position: this.MousePosition, state: ButtonState.Up });
        this.MouseFullObservable.Notify(e);
    }

    private OnMouseMove(e: MouseEvent): void {
        this._mousePosition = this.GetRelativePosition(e.clientX, e.clientY);
    }

    private OnMouseElementResize(e: UIEvent): void {
        this._mouseElementBindingbox = this._mouseElement?.getBoundingClientRect();
    }

    private GetRelativePosition(x: number, y: number): Vec2 {
        const rect: DOMRect = this._mouseElementBindingbox!;
        const cs = Camera.Transform.Scale;

        return [
            (x - rect.left) / rect.width * cs[0] - cs[0] * 0.5,
            (rect.height - (y - rect.top)) / rect.height * cs[1] - cs[1] * 0.5
        ];
    }
}

export const Input = new InputHandler();
export const GamepadHandler = new GamepadToKeys();