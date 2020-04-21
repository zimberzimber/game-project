import Game from "./Workers/Game";
import IndexedDB, { DbSchema } from "./Workers/IndexeddbManager";
import SoundManager, { SoundOptions, SoundTags } from "./Workers/SoundManager";
import Logger from "./Workers/Logger";
import Config from "./Proxies/ConfigProxy";

export class _G {
    static DebugDraw: boolean = true;
    static EnableDebugControlls: boolean = false;
}

window.onload = (e) => {
    Game.OnDomLoaded();
};

const soundSchema: DbSchema = {
    databaseName: 'game',
    stores: [
        {
            storeName: 'sounds',
            keyField: 'url',
            fields: {
                blob: { unique: false }
            }
        }
    ]
}

IndexedDB.OpenDatabase(soundSchema, 5)
    .catch(() => console.warn('(0) Caught'))
    .then(() => {
        SoundManager.Initialize().then(() => {
            setTimeout(() => {
                SoundManager.PlaySound('loop', new SoundOptions(0.5, true, null, SoundTags.Music));
            }, 1000);
        });
    });

// Expose some methods globally for easy acess when in debug mode
if (Config.GetConfig('debug', false) === true) {
    //@ts-ignore
    window.Freeze = () => { Game.paused = !Game.paused; };
    //@ts-ignore
    window.GetEntityTree = () => Game.GetEntityTreeString();
    //@ts-ignore
    window.GetEntityById = (id: number) => Game.GetEntityById(id);

    //@ts-ignore
    window.sm = SoundManager;
    //@ts-ignore
    window.idb = IndexedDB;
    //@ts-ignore
    window.game = Game;
    //@ts-ignore
    window.logger = Logger;
}
