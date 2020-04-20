import ProimseUtil from "../Utility/Promises";
import Logger from "./Logger";

interface DbStorage {
    [key: string]: { version: number, context: IDBDatabase };
}

export interface DbSchema {
    databaseName: string;
    stores: DbStoreSchema[];
}

export interface DbStoreSchema {
    storeName: string;
    keyField: string;
    fields: { [key: string]: DbIndexOptions } | undefined;
}

export interface IndexeddbDataResult {
    error: Error | undefined;
    data: any | undefined;
}

export interface DbIndexOptions {
    unique: boolean;
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

class IndexeddbManager {
    private dbs: DbStorage = {};

    async OpenDatabase(schema: DbSchema, version: number): Promise<void> {
        if (this.dbs[schema.databaseName])
            throw new DatabaseAlreadyOpenError(`Database '${schema.databaseName}' is already open.`);

        //@ts-ignore One very annoying thing about TypeScript is that unlike languages like C#, null/undefined is a separate type, not a 'no reference' flag (laymans term)
        this.dbs[schema.databaseName] = { version, context: undefined };
        const req = window.indexedDB.open(schema.databaseName, version);
        const completionContainer = ProimseUtil.CreateCompletionPromise();

        req.onerror = (e) => {
            delete this.dbs[schema.databaseName];
            Logger.Error(`Failed opening database '${schema.databaseName}', version: ${version}.`);
            Logger.Error(req.error);

            completionContainer.resolve();
            throw new DatabaseOpeningFailedError(`Failed opening database '${schema.databaseName}', version: ${version}.`)
        };

        req.onblocked = () => {
            Logger.Error(`Blocked database '${schema.databaseName}', version: ${version}.`);
            Logger.Error(req.error);
        };

        req.onupgradeneeded = () => {
            const context = req.result;

            context.onerror = () => {
                Logger.Error(`Default error in database: ${schema.databaseName}`);
                Logger.Error(req.error);
            };

            schema.stores.forEach(storeSchema => {
                try { context.deleteObjectStore(storeSchema.storeName); }
                catch (err) { Logger.Warn(`Failed deleting object store '${storeSchema.storeName}' from database '${schema.databaseName}':\n${err.message}`); }

                const objectStore = context.createObjectStore(storeSchema.storeName, { keyPath: storeSchema.keyField });
                if (storeSchema.fields)
                    for (const index in storeSchema.fields.fields)
                        objectStore.createIndex(index, index, storeSchema.fields.fields[index]);
            });

            Logger.Debug(`Done upgrading database '${schema.databaseName}' to version: ${version}.`);
        };

        req.onsuccess = () => {
            this.dbs[schema.databaseName].context = req.result;
            completionContainer.resolve();

            Logger.Debug(`Succeeded opening database:'${schema.databaseName}'. Version: ${version}.`);
        };

        await completionContainer.Promise;
        return;
    }

    async StoreData(dbName: string, storeName: string, data: any): Promise<void> {
        if (!this.dbs[dbName])
            throw new UnopenedDatabaseError(`Database named '${dbName}' was not opened.`);

        const transaction = this.dbs[dbName].context.transaction([storeName], "readwrite");
        const completionContainer = ProimseUtil.CreateCompletionPromise();

        transaction.onerror = () => {
            Logger.Error(`Failed storing data in '${dbName}' -> '${storeName}'`);
            Logger.Error(transaction.error);
            Logger.Error(data);
        }

        const req = transaction.objectStore(storeName).add(data);
        req.onerror = () => completionContainer.resolve();
        req.onsuccess = () => completionContainer.resolve();

        await completionContainer.Promise;
        Logger.Debug(`(IDB) STORE ${dbName} -> ${storeName} -> ${data.url}`);
        return;
    }

    async GetData(dbName: string, storeName: string, key: string): Promise<IndexeddbDataResult> {
        if (!this.dbs[dbName])
            return {
                error: new UnopenedDatabaseError(`Database named '${dbName}' was not opened.`),
                data: undefined
            };

        const completionContainer = ProimseUtil.CreateCompletionPromise();
        const req = this.dbs[dbName].context.transaction(storeName).objectStore(storeName).get(key);
        const result: IndexeddbDataResult = {
            error: undefined,
            data: undefined
        }

        req.onsuccess = () => {
            result.data = req.result;
            completionContainer.resolve();
        };
        req.onerror = () => {
            result.error = new Error(`Error getting data from database: '${dbName}' key: '${key}\n${req.error?.message}`);
            completionContainer.resolve();
        };

        await completionContainer.Promise;
        Logger.Debug(`(IDB) GET ${dbName} -> ${storeName} -> ${key}`);
        Logger.Debug(req.error || req.result);
        return result;
    }

    async CheckExistence(dbName: string, storeName: string, key: string): Promise<boolean> {
        if (!this.dbs[dbName])
            throw new UnopenedDatabaseError(`Database named '${dbName}' was not opened.`);

        const completionContainer = ProimseUtil.CreateCompletionPromise();
        const counter = this.dbs[dbName].context.transaction(storeName).objectStore(storeName).count(IDBKeyRange.only(key));
        let result: boolean = false;

        counter.onsuccess = () => {
            result = counter.result > 0;
            completionContainer.resolve();
        };

        await completionContainer.Promise;
        Logger.Debug(`(IDB) CHECK ${dbName} -> ${storeName} -> ${key} = ${result}`);
        return result;
    }
}

const indexedDb = new IndexeddbManager();
export default indexedDb;