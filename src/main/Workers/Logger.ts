import Config from "../Proxies/ConfigProxy";

enum LogLevel { Debug, Info, Warn, Error, None }
class Logger {
    logLevel: LogLevel;

    constructor() {
        this.logLevel = Config.GetConfig('logLevel', LogLevel.Warn);
    }

    Error = (message: any): void => {
        if (LogLevel.Error >= this.logLevel)
            console.error(message);
    }

    Warn = (message: any): void => {
        if (LogLevel.Warn >= this.logLevel)
            console.warn(message);
    }

    Info = (message: any): void => {
        if (LogLevel.Info >= this.logLevel)
            console.info(message);
    }

    Debug = (message: any): void => {
        if (LogLevel.Debug >= this.logLevel)
            console.debug(message);
    }
}

const logger: Logger = new Logger();
export default logger;