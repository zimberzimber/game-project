import Game from "./Workers/Game";
import IndexedDB, { DbSchema } from "./Workers/IndexeddbManager";
import SoundManager, { SoundOptions, SoundTags } from "./Workers/SoundManager";

export class _G {
    static DebugDraw: boolean = true;
    static EnableDebugControlls: boolean = false;
}

window.onload = (e) => {
    Game.OnDomLoaded();
};

declare global {
    interface Window {
        Freeze: any;
        GetEntityTree: any;
        GetEntityById: any;
    }
}

window.Freeze = () => { Game.paused = !Game.paused; };
window.GetEntityTree = () => Game.GetEntityTreeString();
window.GetEntityById = (id: number) => Game.GetEntityById(id);

const soundSchema: DbSchema = {
    keyField: 'url',
    fields: {
        blob: { unique: false }
    }
}

IndexedDB.OpenDatabase('sounds', 1, soundSchema)
    .catch(() => console.warn('(0) Caught'))
    .then(() => {
        SoundManager.Initialize().then(() => {
            setTimeout(() => {
                SoundManager.PlaySound('tts', new SoundOptions(0.5, true, null, SoundTags.Music));
            }, 1000);
        });
    });

//@ts-ignore
window.sm = SoundManager;
//@ts-ignore
window.idb = IndexedDB;
//@ts-ignore
window.game = Game;