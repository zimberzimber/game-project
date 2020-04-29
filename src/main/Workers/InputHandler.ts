import { IInputObserver, IFullInputObserver } from "../Models/InputModels";

class InputHandler {
    private observers: IInputObserver[] = [];
    private fullObservers: IFullInputObserver[] = [];
    private keysDown: { [key: string]: boolean } = {};
    private keyMap: { [key: number]: string } = {};

    constructor() {
        window.addEventListener('keydown', this.OnKeyDown.bind(this));
        window.addEventListener('keyup', this.OnKeyUp.bind(this));
    }

    BindKeymap(keyMap: { [key: number]: string }): void {
        this.keyMap = keyMap;
    }

    Subscribe(observer: IInputObserver): void {
        const index = this.observers.indexOf(observer, 0);
        if (index == -1)
            this.observers.push(observer);
    }

    Unsubscribe(observer: IInputObserver): void {
        const index = this.observers.indexOf(observer, 0);
        if (index > -1)
            this.observers.splice(index, 1);
    }

    SubscribeFullObserver(fullObserver: IFullInputObserver): void {
        const index = this.fullObservers.indexOf(fullObserver, 0);
        if (index == -1)
            this.fullObservers.push(fullObserver);
    }

    UnsubscribeFullObserver(fullObserver: IFullInputObserver): void {
        const index = this.fullObservers.indexOf(fullObserver, 0);
        if (index > -1)
            this.observers.splice(index, 1);
    }

    OnKeyDown(e: KeyboardEvent): void {
        if (this.keyMap[e.keyCode] && !this.keysDown[this.keyMap[e.keyCode]]) {
            this.keysDown[this.keyMap[e.keyCode]] = true;
            this.observers.forEach(o => o.OnKeyDown(this.keyMap[e.keyCode]));
        }

        this.fullObservers.forEach(o => o.OnKeyDown(e));
    }

    OnKeyUp(e: KeyboardEvent): void {
        if (this.keyMap[e.keyCode] && this.keysDown[this.keyMap[e.keyCode]]) {
            delete this.keysDown[this.keyMap[e.keyCode]];
            this.observers.forEach(o => o.OnKeyUp(this.keyMap[e.keyCode]));
        }

        this.fullObservers.forEach(o => o.OnKeyUp(e));
    }
}

export const Input = new InputHandler();