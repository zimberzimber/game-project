import { IDbSchema, IDbStoreSchema } from "./IndexedDbModels";

export const soundStore: IDbStoreSchema = {
    storeName: 'sounds',
    keyField: 'url',
    fields: {
        blob: { unique: false }
    }
};

export const imageStore: IDbStoreSchema = {
    storeName: 'images',
    keyField: 'url',
    fields: {
        blob: { unique: false }
    }
};

export const gameSchema: IDbSchema = {
    databaseName: 'game',
    version: 1,
    stores: [soundStore, imageStore]
}