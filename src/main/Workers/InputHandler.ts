import { IMouseObserver, IMouseEvent, IKeyboardObserver, IKeyboardEvent, MouseObserverFull, KeyboardObserverFull, ButtonState } from "../Models/InputModels";
import { Vec2 } from "../Models/Vectors";
import { Observable } from "../Models/Observable";

class InputHandler {
    readonly MouseObservable: Observable<IMouseObserver, IMouseEvent> = new Observable();
    readonly KeyboardObservable: Observable<IKeyboardObserver, IKeyboardEvent> = new Observable();
    readonly MouseFullObservable: Observable<MouseObserverFull, MouseEvent> = new Observable();
    readonly KeyboardFullObservable: Observable<KeyboardObserverFull, KeyboardEvent> = new Observable();

    private _mousePosition: Vec2 = [0, 0];
    get MousePosition(): Vec2 { return [this._mousePosition[0], this._mousePosition[1]]; }

    private _keysDown: { [key: string]: boolean } = {};
    private _keyMap: { [key: number]: string } = {};
    set Keymap(keyMap: { [key: number]: string }) { this._keyMap = { ...keyMap }; }

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
    }

    private OnKeyDown(e: KeyboardEvent): void {
        if (this._keyMap[e.keyCode] && !this._keysDown[this._keyMap[e.keyCode]]) {
            this._keysDown[this._keyMap[e.keyCode]] = true;
            this.KeyboardObservable.Notify({ keyName: this._keyMap[e.keyCode], state: ButtonState.Down });
        }
        this.KeyboardFullObservable.Notify(e);
    }

    private OnKeyUp(e: KeyboardEvent): void {
        if (this._keyMap[e.keyCode] && this._keysDown[this._keyMap[e.keyCode]]) {
            delete this._keysDown[this._keyMap[e.keyCode]];
            this.KeyboardObservable.Notify({ keyName: this._keyMap[e.keyCode], state: ButtonState.Up });
        }
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
        return [(x - rect.left) - rect.width / 2, (rect.height - (y - rect.top)) - rect.height / 2];
    }
}

export const Input = new InputHandler();