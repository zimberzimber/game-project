import { IUserSettings } from "../Models/IUserSettings";

class UserSettings {
    private _storageKey: string = 'userSettings';
    private _settings: IUserSettings;

    constructor() {
        const stored = localStorage.getItem(this._storageKey);
        if (stored)
            this._settings = JSON.parse(stored);
        else {
            this._settings = this.GetDefault();
        }
    }

    GetSetting(setting: string): any {
        return this._settings[setting];
    }

    SetSetting(setting: string, value: any): void {
        this._settings[setting] = value;
        localStorage.setItem(this._storageKey, JSON.stringify(this._settings));
    }

    GetFullSettings(): IUserSettings {
        return this._settings;
    }

    SetFullSettings(settings: IUserSettings): void {
        this._settings = settings;
        localStorage.setItem(this._storageKey, JSON.stringify(this._settings));
    }

    Reset(): void {
        this._settings = this.GetDefault();
        localStorage.removeItem(this._storageKey);
    }

    GetDefault(): IUserSettings {
        return {
            masterVolume: 1,
            sfxVolume: 1,
            musicVolume: 1,
            controlsKeymap: {
                87: 'up',
                68: 'right',
                83: 'down',
                65: 'left',
                80: 'pause',
                69: 'interact',
                27: 'cancel'
            }
        }
    }
}

export const Settings = new UserSettings();