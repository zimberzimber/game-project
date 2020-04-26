import { Config } from "../Proxies/ConfigProxy";

export enum LogLevel { Debug, Info, Warn, Error, None }
class Logger {
    logLevel: LogLevel;

    constructor() {
        this.logLevel = Config.GetConfig('logLevel', LogLevel.Warn);
    }

    Error(message: any): void {
        if (LogLevel.Error >= this.logLevel)
            console.error(message);
    }

    Warn(message: any): void {
        if (LogLevel.Warn >= this.logLevel)
            console.warn(message);
    }

    Info(message: any): void {
        if (LogLevel.Info >= this.logLevel)
            console.info(message);
    }

    Debug(message: any): void {
        if (LogLevel.Debug >= this.logLevel)
            console.debug(message);
    }

    Log(message: any, level: LogLevel): void {
        switch (level) {
            case LogLevel.Debug:
                this.Debug(message);
                break;
            case LogLevel.Info:
                this.Info(message);
                break;
            case LogLevel.Warn:
                this.Warn(message);
                break;
            case LogLevel.Error:
                this.Error(message);
                break;
        }
    }
}

export const Log: Logger = new Logger();