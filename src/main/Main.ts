import Game from "./Workers/Game";
import { IDB } from "./Workers/IndexeddbManager";
import { Sounds } from "./Workers/SoundManager";
import { Log } from "./Workers/Logger";
import { Config } from "./Proxies/ConfigProxy";
import { SoundOptions, SoundTags } from "./Models/SoundModels";
import { gameSchema } from "./Models/DbSchemas";
import { Images, Sprites, ISpriteFramesDefinition } from "./Workers/SpriteManager";


window.onload = () => {
};

const soundDefinitions: { [key: string]: string } = {
    silence: 'http://127.0.0.1:3001/sounds/silence.mp3',
    loop: 'http://127.0.0.1:3001/sounds/loop.mp3',
    sfx: 'http://127.0.0.1:3001/sounds/sfx.mp3',
    ui: 'http://127.0.0.1:3001/sounds/ui.mp3',
};

const imageDefenitions = {
    sprites: 'http://127.0.0.1:3001/content/sprites1.png',
    colors: 'https://upload.wikimedia.org/wikipedia/commons/thumb/8/82/YIQ_IQ_plane.svg/1200px-YIQ_IQ_plane.svg.png',
};

const spriteDefinitions: { [key: string]: ISpriteFramesDefinition } = {
    assetMissing: {
        imageName: 'sprites',
        frames: [
            {
                origin: [0, 0],
                size: [0.125, 0.125]
            }
        ],
        names: [],
        aliases: {}
    },
    heart: {
        imageName: 'sprites',
        frames: [
            {
                origin: [0.125, 0],
                size: [0.125, 0.125]
            }
        ],
        names: [],
        aliases: {}
    },
    dice: {
        imageName: 'sprites',
        names: [],
        aliases: {},
        frames: [
            {
                origin: [0, 0.125],
                size: [0.125, 0.125],
            },
            {
                origin: [0.125, 0.125],
                size: [0.125, 0.125],
            },
            {
                origin: [0.250, 0.125],
                size: [0.125, 0.125],
            },
            {
                origin: [0.375, 0.125],
                size: [0.125, 0.125],
            },
            {
                origin: [0.500, 0.125],
                size: [0.125, 0.125],
            },
            {
                origin: [0.625, 0.125],
                size: [0.125, 0.125],
            },
        ]
    }
}

IDB.OpenDatabase(gameSchema)
    .catch((e) => {
        Log.Warn('(0) Caught')
        Log.Warn(e);
    })
    .then(() => {
        Sounds.Initialize(soundDefinitions).then(() => {
            Log.Info('Sound manager initialized')
            Sounds.PlaySound('loop', new SoundOptions(0.5, true, null, SoundTags.Music));
        });

        Images.Initialize(imageDefenitions).then(() => {
            Sprites.Initialize(spriteDefinitions);
            Game.OnDomLoaded();
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
    window.sm = Sounds;
    //@ts-ignore
    window.idb = IDB;
    //@ts-ignore
    window.game = Game;
    //@ts-ignore
    window.log = Log;
    //@ts-ignore
    window.cfg = Config;
    //@ts-ignore
    window.images = Images;
    //@ts-ignore
    window.sprites = Sprites;
}
