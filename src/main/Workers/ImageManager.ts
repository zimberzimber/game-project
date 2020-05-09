import { CDN } from "./CdnManager";
import { Log } from "./Logger";
import { IDB } from "./IndexeddbManager";
import { imageStore, gameSchema, IDBImageDataModel } from "../Models/IndexedDbSchemas";
import { PromiseUtil } from "../Utility/Promises";
import { MiscUtil } from "../Utility/Misc";

class ImageManager {
    private initialized: boolean = false;
    private images: HTMLImageElement[] = [];
    private nameIndex: { [key: string]: number; } = {};

    async Initialize(imageDefinitions: { [key: string]: string; }): Promise<void> {
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
                let base64: string;

                // Add an image even if retreival fails so webgl gets an empty texture instead of nothing in case of an error
                const image = new Image();
                const imageId = nextId++;
                this.images[imageId] = image;
                this.nameIndex[imageName] = imageId;

                // Check the existence of the image in the database.
                // Retreive and save it in memory if it does, or retrieve it from the CDN, save to database, and save in memory if it doesnt
                const exists = await IDB.CheckExistence(gameSchema.databaseName, imageStore.storeName, url);
                if (exists) {
                    const result = await IDB.GetData(gameSchema.databaseName, imageStore.storeName, url);
                    if (result.error) {
                        Log.Error(`Failed getting existing image from database: ${imageName}.`);
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
                        Log.Error(`Failed getting image '${imageName}' from ${url}`);
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
                    completionPromise.resolve();
                };
                image.onerror = () => {
                    Log.Error(`Failed loading image ${imageName}. Make sure its data os correct.`);
                    image.onload = null;
                    image.onerror = null;
                    completionPromise.resolve();
                };

                image.src = base64!;
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

export const Images: ImageManager = new ImageManager();