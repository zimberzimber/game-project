import { PromiseUtil } from "../Utility/Promises";
import { Log } from "./Logger";
import { IDbSchema, DatabaseAlreadyOpenError, DatabaseOpeningFailedError, UnopenedDatabaseError } from "../Models/IndexedDbModels";
import { IDataOrErrorContainer } from "../Models/GenericInterfaces";

interface DbStorage {
    [key: string]: { version: number, context: IDBDatabase };
}

class IndexeddbManager {
    private dbs: DbStorage = {};

    async OpenDatabase(schema: IDbSchema): Promise<void> {
        if (this.dbs[schema.databaseName]) {
            Log.Warn(`Database '${schema.databaseName}' is already open.`);
            return;
        }

        //@ts-ignore One very annoying thing about TypeScript is that unlike languages like C#, null/undefined is a separate type, not a 'no reference'
        this.dbs[schema.databaseName] = { version: schema.version, context: undefined };
        const req = window.indexedDB.open(schema.databaseName, schema.version);
        const completionContainer = PromiseUtil.CreateCompletionPromise();

        req.onerror = (e) => {
            delete this.dbs[schema.databaseName];
            Log.Error(`Failed opening database '${schema.databaseName}', version: ${schema.version}.`);
            Log.Error(req.error);

            completionContainer.resolve();
            throw new DatabaseOpeningFailedError(`Failed opening database '${schema.databaseName}', version: ${schema.version}.`)
        };

        req.onblocked = () => {
            Log.Error(`Blocked database '${schema.databaseName}', version: ${schema.version}.`);
            Log.Error(req.error);
            completionContainer.resolve();
        };

        req.onupgradeneeded = () => {
            Log.Debug(`Started upgrading database '${schema.databaseName}' to version: ${schema.version}.`);
            const context = req.result;

            context.onerror = () => {
                Log.Error(`Default error in database: ${schema.databaseName}`);
                Log.Error(req.error);
            };

            schema.stores.forEach(storeSchema => {
                try { context.deleteObjectStore(storeSchema.storeName); }
                catch (err) { Log.Warn(`Failed deleting object store '${storeSchema.storeName}' from database '${schema.databaseName}':\n${err.message}`); }

                const objectStore = context.createObjectStore(storeSchema.storeName, { keyPath: storeSchema.keyField });
                if (storeSchema.fields)
                    for (const index in storeSchema.fields.fields)
                        objectStore.createIndex(index, index, storeSchema.fields.fields[index]);
            });

            Log.Debug(`Done upgrading database '${schema.databaseName}' to version: ${schema.version}.`);
        };

        req.onsuccess = () => {
            this.dbs[schema.databaseName].context = req.result;
            completionContainer.resolve();

            Log.Debug(`Succeeded opening database:'${schema.databaseName}'. Version: ${schema.version}.`);
        };

        await completionContainer.Promise;
        return;
    }

    async StoreData(dbName: string, storeName: string, data: any): Promise<void> {
        if (!this.dbs[dbName])
            throw new UnopenedDatabaseError(`Database named '${dbName}' was not opened.`);

        const transaction = this.dbs[dbName].context.transaction([storeName], "readwrite");
        const completionContainer = PromiseUtil.CreateCompletionPromise();

        transaction.onerror = () => {
            Log.Error(`Failed storing data in '${dbName}' -> '${storeName}'`);
            Log.Error(transaction.error);
            Log.Error(data);
        }

        const req = transaction.objectStore(storeName).add(data);
        req.onerror = () => completionContainer.resolve();
        req.onsuccess = () => completionContainer.resolve();

        await completionContainer.Promise;
        Log.Debug(`(IDB) STORE ${dbName} -> ${storeName} -> ${data.url}`);
        return;
    }

    async GetData(dbName: string, storeName: string, key: string): Promise<IDataOrErrorContainer> {
        if (!this.dbs[dbName])
            return {
                error: new UnopenedDatabaseError(`Database named '${dbName}' was not opened.`),
                data: undefined
            };

        const completionContainer = PromiseUtil.CreateCompletionPromise();
        const req = this.dbs[dbName].context.transaction(storeName).objectStore(storeName).get(key);
        const result: IDataOrErrorContainer = {
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
        Log.Debug(`(IDB) GET ${dbName} -> ${storeName} -> ${key}`);
        Log.Debug(req.error || req.result);

        return result;
    }

    async CheckExistence(dbName: string, storeName: string, key: string): Promise<boolean> {
        if (!this.dbs[dbName])
            throw new UnopenedDatabaseError(`Database named '${dbName}' was not opened.`);

        const completionContainer = PromiseUtil.CreateCompletionPromise();
        const counter = this.dbs[dbName].context.transaction(storeName).objectStore(storeName).count(IDBKeyRange.only(key));
        let result: boolean = false;

        counter.onsuccess = () => {
            result = counter.result > 0;
            completionContainer.resolve();
        };

        await completionContainer.Promise;
        Log.Debug(`(IDB) CHECK ${dbName} -> ${storeName} -> ${key} = ${result}`);
        return result;
    }
}

export const IDB = new IndexeddbManager();