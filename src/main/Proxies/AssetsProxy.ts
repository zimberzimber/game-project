// Definitions get removed so they don't just sit in memory when they're no longer needed.

import { Log } from "../Workers/Logger";

class AssetsProxy {
    //@ts-ignore
    private _original = window.assets;

    constructor() {
        if (!this._original)
            Log.Error("Asset proxy could not find field 'window.assets'")
    }

    GetImages(): { [key: string]: string } {
        return this._original.images;
    }

    GetAudio(): { [key: string]: string } {
        return this._original.audio;
    }

    Dispose(): void {
        //@ts-ignore
        window.assets = undefined;
        delete this._original.audio;
        delete this._original.images;
        delete this._original;
        this.GetImages = () => { return {} };
        this.GetAudio = () => { return {} };
        this.Dispose = () => { };
    }
}

export const Assets = new AssetsProxy();