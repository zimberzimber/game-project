import { IKeyboardInputObserver, IKeyboardFullInputObserver, IMouseInputObserver, IMouseFullInputObserver } from "../Models/InputModels";
import { Vec2 } from "../Models/Vec2";

class InputHandler {
    private _keyboardObservers: IKeyboardInputObserver[] = [];
    private _keyboardFullObservers: IKeyboardFullInputObserver[] = [];
    private _keysDown: { [key: string]: boolean } = {};
    private _keyMap: { [key: number]: string } = {};

    private _mouseElement: HTMLElement | null = null;
    private _mousePosition: Vec2 = [0, 0];
    private _mouseObservers: IMouseInputObserver[] = [];
    private _mouseFullObservers: IMouseFullInputObserver[] = [];

    constructor() {
        window.addEventListener('keydown', this.OnKeyDown.bind(this));
        window.addEventListener('keyup', this.OnKeyUp.bind(this));
    }

    set Keymap(keyMap: { [key: number]: string }) {
        this._keyMap = { ...keyMap };
    }

    set MouseElemet(element: HTMLElement) {
        this._mouseElement?.removeEventListener('mousedown', this.OnMouseDown.bind(this));
        this._mouseElement?.removeEventListener('mouseup', this.OnMouseUp.bind(this));
        this._mouseElement?.removeEventListener('mousemove', this.OnMouseMove.bind(this));

        this._mouseElement = element;
        this._mouseElement.addEventListener('mousedown', this.OnMouseDown.bind(this));
        this._mouseElement.addEventListener('mouseup', this.OnMouseUp.bind(this));
        this._mouseElement.addEventListener('mousemove', this.OnMouseMove.bind(this));
    }

    get MousePosition(): Vec2 {
        return [this._mousePosition[0], this._mousePosition[1]];
    }

    SubscribeKeyboardEvent(observer: IKeyboardInputObserver): void {
        const index = this._keyboardObservers.indexOf(observer, 0);
        if (index == -1)
            this._keyboardObservers.push(observer);
    }

    UnsubscribeKeyboardEvent(observer: IKeyboardInputObserver): void {
        const index = this._keyboardObservers.indexOf(observer, 0);
        if (index > -1)
            this._keyboardObservers.splice(index, 1);
    }

    SubscribeFullKeyboardEvent(fullObserver: IKeyboardFullInputObserver): void {
        const index = this._keyboardFullObservers.indexOf(fullObserver, 0);
        if (index == -1)
            this._keyboardFullObservers.push(fullObserver);
    }

    UnsubscribeFullKeyboardEvent(fullObserver: IKeyboardFullInputObserver): void {
        const index = this._keyboardFullObservers.indexOf(fullObserver, 0);
        if (index > -1)
            this._keyboardFullObservers.splice(index, 1);
    }

    private OnKeyDown(e: KeyboardEvent): void {
        if (this._keyMap[e.keyCode] && !this._keysDown[this._keyMap[e.keyCode]]) {
            this._keysDown[this._keyMap[e.keyCode]] = true;
            this._keyboardObservers.forEach(o => o.OnKeyDown(this._keyMap[e.keyCode]));
        }
        this._keyboardFullObservers.forEach(o => o.OnKeyDown(e));
    }

    private OnKeyUp(e: KeyboardEvent): void {
        if (this._keyMap[e.keyCode] && this._keysDown[this._keyMap[e.keyCode]]) {
            delete this._keysDown[this._keyMap[e.keyCode]];
            this._keyboardObservers.forEach(o => o.OnKeyUp(this._keyMap[e.keyCode]));
        }
        this._keyboardFullObservers.forEach(o => o.OnKeyUp(e));
    }



    SubscribeMouseEvent(observer: IMouseInputObserver): void {
        const index = this._mouseObservers.indexOf(observer, 0);
        if (index == -1)
            this._mouseObservers.push(observer);
    }

    UnsubscribeMouseEvent(observer: IMouseInputObserver): void {
        const index = this._mouseObservers.indexOf(observer, 0);
        if (index > -1)
            this._mouseObservers.splice(index, 1);
    }

    SubscribeFullMouseEvent(fullObserver: IMouseFullInputObserver): void {
        const index = this._mouseFullObservers.indexOf(fullObserver, 0);
        if (index == -1)
            this._mouseFullObservers.push(fullObserver);
    }

    UnsubscribeFullMouseEvent(fullObserver: IMouseFullInputObserver): void {
        const index = this._mouseFullObservers.indexOf(fullObserver, 0);
        if (index > -1)
            this._mouseFullObservers.splice(index, 1);
    }

    private OnMouseDown(e: MouseEvent): void {
        const rect = this._mouseElement!.getBoundingClientRect();
        const pos: Vec2 = [e.clientX - rect.left, rect.height - (e.clientY - rect.top)];
        this._mouseObservers.forEach(o => o.OnMouseDown(e.button, pos));
        this._mouseFullObservers.forEach(o => o.OnMouseDown(e));
    }
    private OnMouseUp(e: MouseEvent): void {
        const rect = this._mouseElement!.getBoundingClientRect();
        const pos: Vec2 = [e.clientX - rect.left, rect.height - (e.clientY - rect.top)];
        this._mouseObservers.forEach(o => o.OnMouseUp(e.button, pos));
        this._mouseFullObservers.forEach(o => o.OnMouseUp(e));
    }
    private OnMouseMove(e: MouseEvent): void {
        const rect = this._mouseElement!.getBoundingClientRect();
        this._mousePosition = [e.clientX - rect.left, rect.height - (e.clientY - rect.top)];
    }
}

export const Input = new InputHandler();