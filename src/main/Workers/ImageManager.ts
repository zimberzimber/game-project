import { CDN } from "./CdnManager";
import { Log } from "./Logger";
import { IDB } from "./IndexeddbManager";
import { imageStore, gameSchema, IDBImageDataModel } from "../Models/IndexedDbSchemas";
import { PromiseUtil } from "../Utility/Promises";
import { Vec2 } from "../Models/Vectors";

class ImageManager {
    private initialized: boolean = false;
    private images: HTMLImageElement[] = [];
    private nameIndex: { [key: string]: number; } = {};

    Initialize(imageDefinitions: { [key: string]: HTMLImageElement; }) {
        if (this.initialized) {
            Log.Warn('SpriteManager is already initialized.');
            return;
        }

        this.initialized = true;
        let nextId = 0;

        for (const imageName in imageDefinitions) {
            const img = imageDefinitions[imageName];
            const imageId = nextId++;
            this.images[imageId] = img;
            this.nameIndex[imageName] = imageId;
        }
    }

    /**
     * Returns the id of the given image, or -1 if no image follows that name
     * @param name Name of the image
     */
    GetImageIdFromName(name: string): number {
        return this.nameIndex[name] !== undefined ? this.nameIndex[name] : -1;
    }

    GetImageSize(id: number): Vec2 {
        if (this.images[id])
            return [this.images[id].width, this.images[id].height];
        return [0, 0];
    }

    GetImageSizeByName(name: string): Vec2 {
        return this.GetImageSize(this.GetImageIdFromName(name));
    }

    GetImageArray(): HTMLImageElement[] {
        return this.images;
    }

    GetImageById(id: number): HTMLImageElement | null {
        return this.images[id] ? this.images[id] : null;
    }
}

export const Images: ImageManager = new ImageManager();