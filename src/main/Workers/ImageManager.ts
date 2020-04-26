import { CDN } from "./CdnManager";
import { Log } from "./Logger";
import { IDB } from "./IndexeddbManager";
import { imageStore, gameSchema } from "../Models/DbSchemas";
import PromiseUtil from "../Utility/Promises";

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
                let blob: Blob;

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
                        Log.Error(`Failed getting existing image from database: ${imageName}.\n${result.error.message}`);
                        return;
                    }
                    else {
                        blob = result.data.blob;
                    }
                }
                else {
                    const result = await CDN.GetContentFromUrl(url);
                    if (result.error) {
                        Log.Error(`Failed getting image '${imageName}' from ${url}\n${result.error.message}`);
                        return;
                    }
                    else {
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
                };

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