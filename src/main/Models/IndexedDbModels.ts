export interface IDbSchema {
    readonly databaseName: string;
    readonly version: number;
    readonly stores: IDbStoreSchema[];
}

export interface IDbStoreSchema {
    readonly storeName: string;
    readonly keyField: string;
    readonly fields: { readonly [key: string]: IDbIndexOptions } | undefined;
}

export interface IDbIndexOptions {
    unique: boolean;
}

export interface IDBDataModel {
    GetKey(): string;
}

export class DatabaseAlreadyOpenError extends Error {
    constructor(message: any) {
        super(message);
        this.name = "DatabaseAlreadyOpenError";
    }
}

export class DatabaseOpeningFailedError extends Error {
    constructor(message: any) {
        super(message);
        this.name = "DatabaseOpeningFailedError";
    }
}

export class UnopenedDatabaseError extends Error {
    constructor(message: any) {
        super(message);
        this.name = "UnopenedDatabaseError";
    }
}