import { ISPriteData } from "../Models/ISprite";
import { CDN } from "./CdnManager";
import { Log, LogLevel } from "./Logger";
import { IDB } from "./IndexeddbManager";
import { imageStore, gameSchema } from "../Models/DbSchemas";
import PromiseUtil from "../Utility/Promises";
import { OneTimeLog } from "./OneTimeLogger";

class ImageManager {
    private initialized: boolean = false;
    private images: HTMLImageElement[] = [];
    private nameIndex: { [key: string]: number } = {};

    async Initialize(imageDefinitions: { [key: string]: string }): Promise<void> {
        if (this.initialized) {
            Log.Warn('SpriteManager is already initialized.');
            return;
        }

        this.initialized = true;
        let promises: Promise<void>[] = [];
        let nextId = 0;

        for (const imageName in imageDefinitions) {
            const url = imageDefinitions[imageName];
            const promiseMethod = async (): Promise<void> => {
                let blob: Blob;

                // Add an image even if retreival fails so webgl gets an empty texture instead of nothing in case of an error
                const image = new Image();
                const imageId = nextId++;
                this.images[imageId] = image;
                this.nameIndex[imageName] = imageId;

                // Check the existence of the image in the database.
                // Retreive and save it in memory if it does, or retrieve it from the CDN, save to database, and save in memory if it doesnt
                const exists = await IDB.CheckExistence(gameSchema.databaseName, imageStore.storeName, url)
                if (exists) {
                    const result = await IDB.GetData(gameSchema.databaseName, imageStore.storeName, url);
                    if (result.error) {
                        Log.Error(`Failed getting existing image from database: ${imageName}.\n${result.error.message}`);
                        return;
                    } else {
                        blob = result.data.blob;
                    }
                } else {
                    const result = await CDN.GetContentFromUrl(url);
                    if (result.error) {
                        Log.Error(`Failed getting image '${imageName}' from ${url}\n${result.error.message}`);
                        return;
                    } else {
                        blob = result.data;
                        await IDB.StoreData(gameSchema.databaseName, imageStore.storeName, { url: url, blob: result.data });
                    }
                }

                const completionPromise = PromiseUtil.CreateCompletionPromise();

                image.src = URL.createObjectURL(blob);
                image.onload = () => {
                    URL.revokeObjectURL(image.src);
                    completionPromise.resolve();
                    image.onload = null;
                }

                await completionPromise.Promise;
            };
            promises.push(promiseMethod());
        }

        // Wait for the loading to complete
        await Promise.all(promises);

        for (const img in this.images) {
            document.body.appendChild(this.images[img]);
        }
    }

    GetImageIdFromName(name: string): number {
        return this.nameIndex[name] !== undefined ? this.nameIndex[name] : -1;
    }

    GetImageSize(id: number): [number, number] {
        if (this.images[id])
            return [this.images[id].width, this.images[id].height];
        return [0, 0];
    }

    GetImageSizeByName(name: string): [number, number] {
        return this.GetImageSize(this.GetImageIdFromName(name));
    }

    GetImageArray(): HTMLImageElement[] {
        return this.images;
    }
}

interface ISpriteFrame {
    origin: [number, number];
    size: [number, number];
}

export interface ISpriteFramesDefinition {
    imageName: string;
    frames: ISpriteFrame[];
    names: string[];
    aliases: { [key: string]: string };
}

interface ISPriteFramesStorage {
    imageId: number;
    frames: ISpriteFrame[];
    names: string[];
    aliases: { [key: string]: string };
}

class SpriteManager {
    private sprites: { [key: string]: ISPriteFramesStorage } = {};
    private initialized: boolean = false;

    Initialize(spriteDefinitions: { [key: string]: ISpriteFramesDefinition }): void {
        if (this.initialized) {
            Log.Warn('Sprite Manager already initialized.');
            return;
        }

        this.initialized = true;
        for (const sprite in spriteDefinitions) {
            this.sprites[sprite] = {
                frames: spriteDefinitions[sprite].frames,
                names: spriteDefinitions[sprite].names,
                aliases: spriteDefinitions[sprite].aliases,
                imageId: 0
            };

            // Leave the default 0 if no image ID is present;
            const imageId = Images.GetImageIdFromName(spriteDefinitions[sprite].imageName);
            if (imageId > -1)
                this.sprites[sprite].imageId = imageId;
            else
                Log.Error(`Image named '${spriteDefinitions[sprite].imageName}' does not exist. Defaulting texture index for sprite named '${sprite}' to 0.`);
        }
    }

    GetFullImageAsSprite(image: string): ISPriteData {
        const id = Images.GetImageIdFromName(image);
        if (id > -1)
            return { origin: [0, 0], size: Images.GetImageSize(id), imageId: id };

        OneTimeLog.Log(`nonexistentFullImage_${image}`, `Attempted to get non-existent image: ${image}`, LogLevel.Error);
        return { origin: [0, 0], size: [0, 0], imageId: 0 };
    }

    GetSpriteData(sprite: string, frame: number | string): ISPriteData {
        if (!this.sprites[sprite]) {
            OneTimeLog.Log(`nonexistentSprite_${sprite}`, `Attempted to get non-existent sprite: ${sprite}`, LogLevel.Error);
            return { origin: [0, 0], size: [0, 0], imageId: 0 };
        }

        const s: ISPriteFramesStorage = this.sprites[sprite];
        let f: ISpriteFrame | undefined = undefined;

        if (typeof (frame) == "number") {
            f = s.frames[frame];
        } else {
            if (s.aliases[frame])
                frame = s.aliases.frame;

            for (let i = 0; i < s.names.length; i++) {
                if (s.names[i] == frame) {
                    f = s.frames[i];
                    break;
                }
            }
        }

        if (!f) {
            OneTimeLog.Log(`nonexistentSpriteFrame_${sprite}_${frame}`, `Attempted to get non-existent from '${frame}' from sprite: ${sprite}`, LogLevel.Error);
            return { origin: [0, 0], size: [0, 0], imageId: 0 };
        }
        return { origin: [f.origin[0], f.origin[1]], size: [f.size[0], f.size[1]], imageId: s.imageId };
    }
}

export const Images: ImageManager = new ImageManager();
export const Sprites: SpriteManager = new SpriteManager();