import { Game } from "./Workers/Game";
import { IDB } from "./Workers/IndexeddbManager";
import { Sounds } from "./Workers/SoundManager";
import { Log } from "./Workers/Logger";
import { Config } from "./Proxies/ConfigProxy";
import { gameSchema, imageStore, IDBImageDataModel, IDBSoundDataModel } from "./Models/IndexedDbSchemas";
import { Sprites } from "./Workers/SpriteManager";
import { Images } from "./Workers/ImageManager";
import { Audio } from "./Workers/SoundPlayer";
import { Input } from "./Workers/InputHandler";
import { SpriteDefinitions, ClearSpriteDefinitions, FontDefinitions, ClearFontDefinitions } from "./AssetDefinitions/SpriteDefinitions";
import { Assets } from "./Proxies/AssetsProxy";
import { Settings } from "./Workers/SettingsManager";
import { PromiseUtil } from "./Utility/Promises";
import { Rendering } from "./Workers/RenderingPipeline";
import { Camera } from "./Workers/CameraManager";
import { Vec2Utils } from "./Utility/Vec2";
import { ScalarUtil } from "./Utility/Scalar";
import { MiscUtil } from "./Utility/Misc";
import { CDN } from "./Workers/CdnManager";
import { StateManager } from "./Workers/GameStateManager";

let domCompletionPromise: any = PromiseUtil.CreateCompletionPromise();
window.addEventListener('DOMContentLoaded', domCompletionPromise.resolve);
window.addEventListener('DOMContentLoaded', () => loadingHandler.SetHtmlElement(document.getElementById('loading-element')));

let loadingHandler: any = (() => {
    let imageCount: number = Object.keys(Assets.GetImages()).length;
    let imagesLoaded: number = 0;

    let soundCount: number = Object.keys(Assets.GetAudio()).length;
    let soundsLoaded: number = 0;

    let htmlElement: HTMLElement | null = null;
    let messages: string = '';

    let UpdateLoadingMessage = () => {
        if (htmlElement)
            htmlElement.innerText = `Loading...\nImages: ${imagesLoaded}/${imageCount}\nAudio: ${soundsLoaded}/${soundCount}\n${messages}`;
    };

    return {
        ImageLoaded: (): void => {
            imagesLoaded++;
            UpdateLoadingMessage();
        },
        SoundLoaded: (): void => {
            soundsLoaded++
            UpdateLoadingMessage();
        },
        SetHtmlElement: (element: HTMLElement | null): void => {
            htmlElement = element;
            UpdateLoadingMessage();
        },
        AppendMessage: (message: string): void => {
            messages = `${messages}\n${message}`;
            UpdateLoadingMessage();
        },
        Clear: (): void => {
            messages = '';
            if (htmlElement) htmlElement.innerText = '';
        }
    }
})();

IDB.OpenDatabase(gameSchema)
    .catch((e) => Log.Error(e))
    .then(() => {
        const imagesPromise = LoadImages();
        const audioPromise = LoadSounds();

        Promise.all([audioPromise, imagesPromise, domCompletionPromise.Promise]).then(() => {
            window.removeEventListener('DOMContentLoaded', domCompletionPromise.resolve);
            domCompletionPromise = undefined;
            loadingHandler.Clear();
            loadingHandler = undefined;
            Assets.Dispose();

            const canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
            canvas.width = 600;
            canvas.height = 500;

            Rendering.Init(canvas);

            Camera.Transform.Scale = [canvas.width, canvas.height];
            Camera.Transform.Position = [0, 0];
            Camera.Transform.Rotation = 0;

            Input.MouseElement = canvas;
            Input.Keymap = Settings.GetSetting('controlsKeymap');

            StateManager.Initialize();
            requestAnimationFrame(Game.Update.bind(Game))
        });
    });

let LoadImages = async (): Promise<void> => {
    let promises: Promise<void>[] = [];
    const imageDefs = Assets.GetImages();
    const images: { [key: string]: HTMLImageElement } = {};

    // Create font glyph images, inject them into sprite definitions and images object
    for (const name in FontDefinitions) {
        const config = FontDefinitions[name];
        const result = MiscUtil.GenerateASCIITextImage(config.font, config.size, config.outlineWidth);
        images[name] = result.image;
        SpriteDefinitions[name] = {
            sourceImageName: name,
            names: result.names,
            frames: result.frames,
            isPixelCoordinates: true,
            metadata: { charWidths: result.charWidths, maxCharHeight: result.maxCharHeight },
        }
    }

    // Get images from URLs or IDB, save them into the 'images' object
    for (const name in imageDefs) {
        const url = imageDefs[name];

        const promiseMethod = async (): Promise<void> => {
            // base64 image for a 1x1 black image
            let base64: string = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII=';

            // Create an image even if retreival fails so webgl gets an empty texture instead of nothing in case of an error
            const image = new Image();

            // Check the existence of the image in the database.
            // Retreive and save it in memory if it does, or retrieve it from the CDN, save to database, and save in memory if it doesnt
            const exists = await IDB.CheckExistence(gameSchema.databaseName, imageStore.storeName, url);
            if (exists) {
                const result = await IDB.GetData(gameSchema.databaseName, imageStore.storeName, url);
                if (result.error) {
                    loadingHandler.AppendMessage(`Failed pulling existing image from database: ${name}`);
                    Log.Error(result.error);
                    return;
                }
                else {
                    base64 = (result.data as IDBImageDataModel).base64;
                }
            }
            else {
                const result = await CDN.GetContentFromUrl(url);
                if (result.error) {
                    loadingHandler.AppendMessage(`Failed fetching image from CDN: ${name}`);
                    Log.Error(result.error);
                    return;
                }
                else {
                    const completionPromise = PromiseUtil.CreateCompletionPromise();

                    var reader = new FileReader();
                    reader.readAsDataURL(result.data);
                    reader.onloadend = () => {
                        base64 = reader.result as string;
                        completionPromise.resolve();
                    }

                    await completionPromise.Promise;
                    await IDB.StoreData(gameSchema.databaseName, imageStore.storeName, new IDBImageDataModel(url, base64!));
                }
            }

            const completionPromise = PromiseUtil.CreateCompletionPromise();
            image.onload = () => {
                image.onload = null;
                image.onerror = null;
                loadingHandler.ImageLoaded();
                completionPromise.resolve();
            };
            image.onerror = () => {
                Log.Error(`Failed loading image ${name} as HTML image element.`);
                image.onload = null;
                image.onerror = null;
                completionPromise.resolve();
            };

            image.src = base64;
            await completionPromise.Promise;
            images[name] = image;
        };
        promises.push(promiseMethod());
    }

    // Wait for the loading to complete
    await Promise.all(promises);

    Images.Initialize(images);
    Sprites.Initialize(SpriteDefinitions);
    ClearSpriteDefinitions();
    ClearFontDefinitions();
}

let LoadSounds = async (): Promise<void> => {
    const soundSourceDefinitions = Assets.GetAudio();
    const promises: Promise<void>[] = [];
    const buffers: { [key: string]: ArrayBuffer } = {};

    for (const sourceName in soundSourceDefinitions) {
        const url = soundSourceDefinitions[sourceName];

        const method = async (): Promise<void> => {
            const exists = await IDB.CheckExistence('game', 'sounds', url)
            let arrayBuffer: ArrayBuffer;

            if (exists) {
                const result = await IDB.GetData('game', 'sounds', url);
                if (result.error) {
                    loadingHandler.AppendMessage(`Failed pulling existing sound from database: ${sourceName}`);
                    Log.Error(result.error);
                    return;
                }
                else {
                    arrayBuffer = (result.data as IDBSoundDataModel).buffer;
                }
            } else {
                const result = await CDN.GetContentFromUrl(url);
                if (result.error) {
                    loadingHandler.AppendMessage(`Failed fetching sound from CDN: ${sourceName}`);
                    Log.Error(result.error);
                    return;
                }
                else {
                    arrayBuffer = await result.data.arrayBuffer();
                    await IDB.StoreData('game', 'sounds', new IDBSoundDataModel(url, arrayBuffer));
                }
            }
            buffers[sourceName] = arrayBuffer;
            loadingHandler.SoundLoaded();
        };

        promises.push(method());
    }

    // Wait for the loading to complete
    await Promise.all(promises);
    Sounds.Initialize(buffers);
}

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
        scalaru: ScalarUtil,
        miscu: MiscUtil,
        statemanager: StateManager
    }

    //@ts-ignore
    window.formatArray = (arr: any[], jump: number) => {
        let str = '';

        for (let i = 0; i < arr.length; i++) {
            if (i % jump == 0 && i > 0)
                str += '\n';

            str += `${arr[i].toString()}\t`;
        }

        console.log(`Array length: ${arr.length}, split into rows of ${jump}:`);
        console.log(str);
    }

    //@ts-ignore
    window.closeDbs = () => { for (let name in IDB.dbs) IDB.dbs[name].context.close(); }
}
