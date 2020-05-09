import { IDbSchema, IDbStoreSchema, IDBDataModel } from "./IndexedDbModels";

export const soundStore: IDbStoreSchema = {
    storeName: 'sounds',
    keyField: 'url',
    fields: {
        buffer: { unique: false }
    }
};

export const imageStore: IDbStoreSchema = {
    storeName: 'images',
    keyField: 'url',
    fields: {
        base64: { unique: false }
    }
};

export const gameSchema: IDbSchema = {
    databaseName: 'game',
    version: 1,
    stores: [soundStore, imageStore]
}

export class IDBSoundDataModel implements IDBDataModel {
    readonly url: string;
    readonly buffer: ArrayBuffer;

    constructor(url: string, buffer: ArrayBuffer) {
        this.url = url;
        this.buffer = buffer;
    }

    GetKey(): string { return this.url; }
}

export class IDBImageDataModel implements IDBDataModel {
    readonly url: string;
    readonly base64: string;

    constructor(url: string, base64: string) {
        this.url = url;
        this.base64 = base64;
    }

    GetKey(): string { return this.url; }
}