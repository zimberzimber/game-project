import ProimseUtil, { CompletionPromiseData } from "../Utility/Promises";

interface DbStorage {
    [key: string]: { version: number, context: any };
}

export interface DbSchema {
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

    async OpenDatabase(dbName: string, version: number, schema: DbSchema): Promise<void> {
        if (this.dbs[dbName])
            throw new DatabaseAlreadyOpenError(`Database '${dbName}' is already open.`);

        this.dbs[dbName] = { version, context: undefined };
        const req = window.indexedDB.open(dbName, version);
        const completionContainer: CompletionPromiseData = ProimseUtil.CreateCompletionPromise();

        req.onerror = (e) => {
            delete this.dbs[dbName];
            console.error(`Failed opening database '${dbName}', version: ${version}.`);
            console.error(e);
            completionContainer.reject();
            throw new DatabaseOpeningFailedError(`Failed opening database '${dbName}', version: ${version}.`)
        };

        req.onblocked = (e) => {
            console.error(`Blocked database '${dbName}', version: ${version}.`);
            console.error(e);
        };

        req.onupgradeneeded = (e) => {
            const context = req.result;

            context.onerror = (e) => {
                console.error(`Default error in database: ${dbName}`);
                console.error(e);
            };

            try { context.deleteObjectStore(dbName); }
            catch (err) { console.warn(`Failed deleting object store '${dbName}':\n${err.message}`); }

            const objectStore = context.createObjectStore(dbName, { keyPath: schema.keyField });
            if (schema.fields)
                for (const index in schema.fields)
                    objectStore.createIndex(index, index, schema.fields[index]);

            console.log(`Done upgrading database '${dbName}' to version: ${version}.`);
        };

        req.onsuccess = (e) => {
            this.dbs[dbName].context = req.result;
            completionContainer.resolve();
        };

        await completionContainer.Promise;
        return;
    }

    async StoreData(dbName: string, data: {}): Promise<void> {
        if (!this.dbs[dbName])
            throw new UnopenedDatabaseError(`Database named '${dbName}' was not opened.`);

        const transaction = this.dbs[dbName].context.transaction([dbName], "readwrite");
        const completionContainer: CompletionPromiseData = ProimseUtil.CreateCompletionPromise();

        transaction.onerror = (e) => {
            console.error(`Failed storing data in '${dbName}'.\n${e.target.error}`);
            console.error(data);
        }

        const objectStore = transaction.objectStore(dbName);
        const req = objectStore.add(data);
        req.onerror = completionContainer.resolve;
        req.onblocked = completionContainer.resolve;
        req.onsuccess = completionContainer.resolve;

        await completionContainer.Promise;
        return;
    }

    async GetData(dbName: string, key: string): Promise<IndexeddbDataResult> {
        if (!this.dbs[dbName])
            return {
                error: new UnopenedDatabaseError(`Database named '${dbName}' was not opened.`),
                data: undefined
            };

        const completionContainer: CompletionPromiseData = ProimseUtil.CreateCompletionPromise();
        const storeRequest = this.dbs[dbName].context.transaction([dbName]).objectStore(dbName).get(key);
        const result: IndexeddbDataResult = {
            error: undefined,
            data: undefined
        }

        storeRequest.onsuccess = (e: any) => {
            result.data = e.target.result;
            completionContainer.resolve();
        };
        storeRequest.onblocked = (e: any) => {
            result.error = new Error(`Get data request blocked for database: '${dbName}' key: '${key}`);
            completionContainer.reject();
        };
        storeRequest.onerror = (e: any) => {
            result.error = new Error(`Error getting data from database: '${dbName}' key: '${key}`);
            completionContainer.reject();
        };

        await completionContainer.Promise;
        return result;

    }

    async CheckExistence(dbName: string, key: string): Promise<boolean> {
        if (!this.dbs[dbName])
            throw new UnopenedDatabaseError(`Database named '${dbName}' was not opened.`);

        const completionContainer: CompletionPromiseData = ProimseUtil.CreateCompletionPromise();
        const counter = this.dbs[dbName].context.transaction([dbName]).objectStore(dbName).count(IDBKeyRange.only(key));
        let result: boolean = false;

        counter.onsuccess = () => {
            result = counter.result > 0;
            completionContainer.resolve();
        };

        await completionContainer.Promise;
        return result;
    }
}

const indexedDb = new IndexeddbManager();
export default indexedDb;