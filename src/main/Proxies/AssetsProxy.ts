// Definitions get removed so they don't just sit in memory when they're no longer needed.

import { Log } from "../Workers/Logger";

class AssetsProxy {
    //@ts-ignore
    private _original = window.assets;

    constructor(){
        if (!this._original)
            Log.Error("Asset proxy could not find field 'window.assets'")
    }

    GetAndTerminateImages(): { [key: string]: string } {
        const temp = this._original.images;
        delete this._original.images;
        return temp;
    }

    GetAndTerminateAudio(): { [key: string]: string } {
        const temp = this._original.audio;
        delete this._original.audio;
        return temp;
    }

    FinalTermination(): void {
        //@ts-ignore
        window.assets = undefined;
        delete this._original;
        this.GetAndTerminateImages = () => { return {} };
        this.GetAndTerminateAudio = () => { return {} };
        this.FinalTermination = () => { };
    }
}

export const Assets = new AssetsProxy();