export enum ControlKey {
    up, down, left, right,
    pause,
    action1, action2, action3, action4
}

// control key : character code
export interface IKeymap {
    [ControlKey.up]: string;
    [ControlKey.down]: string;
    [ControlKey.left]: string;
    [ControlKey.right]: string;
    [ControlKey.pause]: string;
    [ControlKey.action1]: string;
    [ControlKey.action2]: string;
    [ControlKey.action3]: string;
    [ControlKey.action4]: string;
}

export class KeymapContainer {
    private _keyToCharcode: IKeymap;
    private _codeToKey: { [key: number]: ControlKey };

    set Keymap(keymap: IKeymap) {
        this._keyToCharcode = Object.assign({}, keymap);
        this._codeToKey = {};
        for (let key in keymap)
            //@ts-ignore
            this._codeToKey[keymap[key]] = ControlKey[ControlKey[key]];
    }

    constructor(keymap: IKeymap) {
        this.Keymap = keymap;
    }

    GetKeyForCharcode(code: string): ControlKey | null {
        return this._codeToKey[code] !== undefined ? this._codeToKey[code] : null;
    }

    GetCharcodeForKey(key: ControlKey): string | null {
        return this._keyToCharcode[key] !== undefined ? this._keyToCharcode[key] : null;
    }
}