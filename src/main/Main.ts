import { Game } from "./Workers/Game";
import { IDB } from "./Workers/IndexeddbManager";
import { Sounds } from "./Workers/SoundManager";
import { Log } from "./Workers/Logger";
import { Config } from "./Proxies/ConfigProxy";
import { gameSchema } from "./Models/IndexedDbSchemas";
import { Sprites } from "./Workers/SpriteManager";
import { Images } from "./Workers/ImageManager";
import { Audio } from "./Workers/SoundPlayer";
import { Input } from "./Workers/InputHandler";
import { SpriteDefinitions } from "./AssetDefinitions/SpriteDefinitions";
import { Assets } from "./Proxies/AssetsProxy";
import { Settings } from "./Workers/SettingsManager";
import { PromiseUtil } from "./Utility/Promises";
import { Rendering } from "./Workers/RenderingPipeline";
import { Camera } from "./Workers/CameraManager";
import { Vec2Utils } from "./Utility/Vec2";
import { ScalarUtil } from "./Utility/Scalar";

let domPromise: any = PromiseUtil.CreateCompletionPromise();
window.addEventListener('DOMContentLoaded', domPromise.resolve);

IDB.OpenDatabase(gameSchema)
    .catch((e) => {
        Log.Warn('(0) Caught')
        Log.Warn(e);
    })
    .then(() => {
        const imagesPromise = Images.Initialize(Assets.GetAndTerminateImages());
        const audioPromise = Sounds.Initialize(Assets.GetAndTerminateAudio());
        const spritesPromise = PromiseUtil.CreateCompletionPromise();

        imagesPromise.then(() => {
            Sprites.Initialize(SpriteDefinitions);
            spritesPromise.resolve();
        });

        Promise.all([audioPromise, imagesPromise, spritesPromise, domPromise.Promise]).then(() => {
            window.removeEventListener('DOMContentLoaded', domPromise.resolve);
            domPromise = undefined;
            Assets.FinalTermination();
            Game.Start();
        });
    });

// Expose some methods globally for easy acess when in debug mode
if (Config.GetConfig('debug', false) === true) {
    //@ts-ignore
    window.Freeze = () => { Game.Paused = !Game.Paused; };
    //@ts-ignore
    window.GetEntityTree = () => Game.GetEntityTreeString();
    //@ts-ignore
    window.GetEntityById = (id: number) => Game.GetEntityById(id);

    //@ts-ignore
    window.zz = {
        sounds: Sounds,
        idb: IDB,
        game: Game,
        log: Log,
        cfg: Config,
        images: Images,
        sprites: Sprites,
        audio: Audio,
        input: Input,
        settings: Settings,
        rendering: Rendering,
        camera: Camera,
        vec2u: Vec2Utils,
        scalaru: ScalarUtil
    }

    //@ts-ignore
    window.stop = () => Game.Paused = true;
}
