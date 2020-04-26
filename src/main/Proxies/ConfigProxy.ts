class ConfigProxy {
    //@ts-ignore
    private originalConfig: any = window.configuration;

    GetConfig = (field: string, defaultValue: any): any =>
        this.originalConfig[field] !== undefined ? this.originalConfig[field] : defaultValue;

    SetConfig = (field: string, value: any): void =>
        this.originalConfig[field] = value;
}

export const Config = new ConfigProxy();