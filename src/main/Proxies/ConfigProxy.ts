class ConfigProxy {
    //@ts-ignore
    private _original = window.configuration;

    GetConfig = (field: string, defaultValue: any): any =>
        this._original[field] !== undefined ? this._original[field] : defaultValue;

    SetConfig = (field: string, value: any): void =>
    this._original[field] = value;
}

export const Config = new ConfigProxy();