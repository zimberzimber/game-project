import { KeyDefs, KeyNames } from "../Models/InputHelpers";

export interface IKeyPressObserver {
    OnKeyDown(key: KeyNames): void;
    OnKeyUp(key: KeyNames): void;
}

export abstract class BaseKeyPreset {
    observers: IKeyPressObserver[] = [];
    keysDown = {};
    keyDefs: KeyDefs;

    Subscribe(observer: IKeyPressObserver): void {
        this.observers.push(observer);
    }

    Unsubscribe(observer: IKeyPressObserver): void {
        const index = this.observers.indexOf(observer, 0);
        if (index > -1)
            this.observers.splice(index, 1);
    }

    private NotifyObserversKeyDown(key: KeyNames): void {
        this.observers.forEach(o => o.OnKeyDown(key));
    }

    private NotifyObserversKeyUp(key: KeyNames): void {
        this.observers.forEach(o => o.OnKeyUp(key));
    }

    private GetKeyName(keyCode: number): KeyNames | null {
        switch (keyCode) {
            case this.keyDefs["up"]:
                return KeyNames.up;
            case this.keyDefs["down"]:
                return KeyNames.down;
            case this.keyDefs["left"]:
                return KeyNames.left;
            case this.keyDefs["right"]:
                return KeyNames.right;
            case this.keyDefs["pause"]:
                return KeyNames.pause;
            case this.keyDefs["interact"]:
                return KeyNames.interact;
            case this.keyDefs["cancel"]:
                return KeyNames.cancel;
        }
        return null;
    }

    ParseKeyDown(event: any) {
        const key = this.GetKeyName(event.keyCode);
        if (key !== null && !this.keysDown[key]) {
            this.keysDown[key] = true;
            this.NotifyObserversKeyDown(key);
        }
    }

    ParseKeyUp(event: any) {
        const key = this.GetKeyName(event.keyCode);
        if (key !== null && this.keysDown[key]) {
            this.keysDown[key] = false;
            this.NotifyObserversKeyUp(key);
        }
    }
}
