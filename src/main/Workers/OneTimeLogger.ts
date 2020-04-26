import { LogLevel, Log } from "./Logger";

class OneTimeLogger {
    private storage: { [key: string]: { message: any, level: LogLevel } } = {};

    Log(key: string, message: any, level: LogLevel): void {
        if (!this.storage[key]) {
            this.storage[key] = { message, level };
            Log.Log(message, level);
        }
    }

    RelogMessages(): void {
        for (const key in this.storage)
            Log.Log(this.storage[key].message, this.storage[key].level);
    }

    ClearStorage(): void {
        for (const key in this.storage)
            delete this.storage[key].message;
    }
}

export const OneTimeLog = new OneTimeLogger();