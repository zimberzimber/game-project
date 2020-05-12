import { Log } from "../Workers/Logger";

interface IConfigObserver { (newValue: any): void; }

class ConfigProxy {
    //@ts-ignore
    private _original = window.configuration;
    private _observers: { [key: string]: IConfigObserver[] } = {};

    
    constructor(){
        if (!this._original)
            Log.Error("Config proxy could not find field 'window.configuration'")
    }

    /**
     * Get a configuration in run time.
     * @param field Desired field
     * @param defaultValue Value to default to in case of a nonexistent field
     */
    GetConfig = (field: string, defaultValue: any): any =>
        this._original[field] !== undefined ? this._original[field] : defaultValue;


    /**
     * Change a configuration in run time.
     * @param field Desired field
     * @param value Desired value
     */
    SetConfig = (field: string, value: any): void => {
        this._original[field] = value;
        this._observers[field].forEach(o => o(value));
    }

    /**
     * Subscribe an observer to a certain field in the config.
     * @param field Field name
     * @param observer Observer method
     */
    Subscribe = (field: string, observer: IConfigObserver): void => {
        if (!this._observers[field])
            this._observers[field] = [];

        if (this._observers[field].indexOf(observer) == -1)
            this._observers[field].push(observer);
    }

    /**
     * Unsubscribe an observer from a certain field in the config.
     * @param field Field name
     * @param observer Observer method
     */
    Unsubscribe = (field: string, observer: IConfigObserver): void => {
        if (this._observers[field]) {
            const index = this._observers[field].indexOf(observer, 0);
            if (index > -1)
                this._observers[field].splice(index, 1);
        }
    }
}

export const Config = new ConfigProxy();