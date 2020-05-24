import { Log } from "../Workers/Logger";
import { Observable, IObserver } from "../Models/Observable";

export interface IConfigEventArgs {
    field: string;
    newValue: any;
}

export interface IConfigObserver extends IObserver<IConfigEventArgs> {
    OnObservableNotified(args: IConfigEventArgs): void;
}

class ConfigProxy {
    //@ts-ignore
    private _original = window.configuration;
    Observable: Observable<IObserver<IConfigEventArgs>, IConfigEventArgs> = new Observable();

    constructor() {
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
        this.Observable.Notify({ field, newValue: value });
    }
}

export const Config = new ConfigProxy();