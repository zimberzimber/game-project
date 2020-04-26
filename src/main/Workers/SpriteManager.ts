import { ISpriteFrame, ISingleFrameSpriteDefinition, IMultiFrameSpriteDefinition, ISPriteData } from "../Models/Sprites";
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

interface ISPriteFramesStorage {
    imageId: number;
    frames: ISpriteFrame | ISpriteFrame[];
    names?: string[];
    aliases?: { [key: string]: string };
}

class SpriteManager {
    private sprites: { [key: string]: ISPriteFramesStorage } = {};
    private initialized: boolean = false;

    Initialize(spriteDefinitions: { [key: string]: ISingleFrameSpriteDefinition | IMultiFrameSpriteDefinition }): void {
        if (this.initialized) {
            Log.Warn('Sprite Manager already initialized.');
            return;
        }

        this.initialized = true;
        for (const spriteName in spriteDefinitions) {

            // Get the images ID. Default to 0 and print a message if its an invalid image.
            let imageId = Images.GetImageIdFromName(spriteDefinitions[spriteName].sourceImageName);
            if (imageId == -1) {
                Log.Error(`Attempted to fetch nonexistent image named '${spriteDefinitions[spriteName].sourceImageName}' for sprite: ${spriteName}`)
                imageId = 0;
            }

            if ((spriteDefinitions[spriteName] as ISingleFrameSpriteDefinition).frame) {
                const def = spriteDefinitions[spriteName] as ISingleFrameSpriteDefinition;
                this.sprites[spriteName] = {
                    imageId: imageId,
                    frames: def.frame
                }

            } else if ((spriteDefinitions[spriteName] as IMultiFrameSpriteDefinition).frames) {
                const def = spriteDefinitions[spriteName] as IMultiFrameSpriteDefinition;
                this.sprites[spriteName] = {
                    imageId: imageId,
                    frames: def.frames,
                    names: def.names || undefined, // Adding an underfined in case of the definition having an empty array
                    aliases: def.aliases || undefined, // Adding an underfined in case of the definition having an empty array
                }

            } else { // Also covers empty frames array
                Log.Error(`Sprite definition for ${spriteName} lacks frame definitions. Ignoring.`)
                continue;
            }
        }
    }

    GetFullImageAsSprite(image: string): ISPriteData {
        const id = Images.GetImageIdFromName(image);
        if (id > -1)
            return { origin: [0, 0], size: Images.GetImageSize(id), imageId: id };

        OneTimeLog.Log(`nonexistentFullImage_${image}`, `Attempted to get non-existent image: ${image}`, LogLevel.Error);
        return { origin: [0, 0], size: [0, 0], imageId: 0 };
    }

    GetSprite(name: string, frame: number | string | void): ISPriteData {
        let result: ISPriteData = { origin: [0, 0], size: [0, 0], imageId: 0 };

        if (this.sprites[name]) {
            const s: ISPriteFramesStorage = this.sprites[name];

            if (typeof (frame) == 'number') {
                if (s.frames[frame]) {
                    result.origin = s.frames[frame].origin;
                    result.size = s.frames[frame].size;
                    result.imageId = s.imageId;
                } else {
                    OneTimeLog.Log(`getSprite_nonexistent_numerical_frame_${name}_${frame}`, `Nonexistent numerical frame ${frame} for sprite: ${name}`, LogLevel.Error);
                }
            } else if (typeof (frame) == 'string') {
                if (s.names) {
                    let index = -1;
                    let alias = name;
                    if (s.aliases && s.aliases[name])
                        alias = s.aliases[name];

                    for (let i = 0; i < s.names.length; i++) {
                        if (s.names[i] == alias) {
                            index = i;
                            break;
                        }
                    }

                    if (index > -1) {
                        if (s.frames[index]) {
                            result.origin = s.frames[index].origin;
                            result.size = s.frames[index].size;
                            result.imageId = s.imageId;
                        } else {
                            OneTimeLog.Log(`getSprite_out_of_bound_frame_name_${name}_${frame}`, `Frame named '${frame}' is out of bounds for sprite info array in sprite: ${name}`, LogLevel.Error);
                        }
                    } else {
                        OneTimeLog.Log(`getSprite_nonexistent_frame_name_${name}_${frame}`, `Nonexistent frame named '${frame}' for sprite: ${name}`, LogLevel.Error);
                    }
                } else {
                    OneTimeLog.Log(`getSprite_no_frame_names_${name}`, `There are no frame names defined for sprite: ${name}`, LogLevel.Error);
                }
            } else {
                if (s.frames instanceof Array) {
                    OneTimeLog.Log(`getSprite_no_frame_requested_${name}`, `No frame was requested for multiframed sprite: ${name}`, LogLevel.Error);
                } else {
                    result.origin = s.frames.origin;
                    result.size = s.frames.size;
                    result.imageId = s.imageId;
                }
            }
        } else {
            OneTimeLog.Log(`nonexistentSprite_${name}`, `Attempted to get non-existent sprite: ${name}`, LogLevel.Error);
        }

        return result;
    }
}

export const Images: ImageManager = new ImageManager();
export const Sprites: SpriteManager = new SpriteManager();