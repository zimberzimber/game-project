export enum ControlKey {
    up, down, left, right,
    pause,
    action1, action2, action3, action4
}

// control key : character code
export interface IKeymap {
    [ControlKey.up]: number;
    [ControlKey.down]: number;
    [ControlKey.left]: number;
    [ControlKey.right]: number;
    [ControlKey.pause]: number;
    [ControlKey.action1]: number;
    [ControlKey.action2]: number;
    [ControlKey.action3]: number;
    [ControlKey.action4]: number;
}

export class KeymapContainer {
    private _keyToCharcode: IKeymap;
    private _chardcodeToKey: { [key: number]: ControlKey };

    set Keymap(keymap: IKeymap) {
        this._keyToCharcode = Object.assign({}, keymap);
        this._chardcodeToKey = {};
        for (let key in keymap)
            //@ts-ignore
            this._chardcodeToKey[keymap[key]] = ControlKey[ControlKey[key]];
    }

    constructor(keymap: IKeymap) {
        this.Keymap = keymap;
    }

    GetKeyForCharcode(charcode: number): ControlKey | null {
        return this._chardcodeToKey[charcode] !== undefined ? this._chardcodeToKey[charcode] : null;
    }

    GetCharcodeForKey(key: ControlKey): number | null {
        return this._keyToCharcode[key] !== undefined ? this._keyToCharcode[key] : null;
    }
}