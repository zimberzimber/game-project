class ConfigProxy {
    //@ts-ignore
    originalConfig: any = window.configuration;

    GetConfig = (field: string, defaultValue: any): any =>
        this.originalConfig[field] ? this.originalConfig[field] : defaultValue;
}

const configProxy = new ConfigProxy();
export default configProxy;