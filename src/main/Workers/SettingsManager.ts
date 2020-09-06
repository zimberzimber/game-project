import { IUserSettings, UserSetting, ISettingsEventArgs } from "../Models/IUserSettings";
import { ControlKey } from "../Models/ControlKeys";
import { IObserver, Observable } from "../Models/Observable";

const GetDefaultSettings = (): IUserSettings => {
    return {
        [UserSetting.MasterVolume]: 1,
        [UserSetting.SfxVolume]: 1,
        [UserSetting.MusicVolume]: 1,
        [UserSetting.ControlsKeymap]: {
            [ControlKey.up]: 87,
            [ControlKey.down]: 83,
            [ControlKey.left]: 65,
            [ControlKey.right]: 68,
            [ControlKey.pause]: 80,
            [ControlKey.action1]: 69,
            [ControlKey.action2]: 27,
            [ControlKey.action3]: 82,
            [ControlKey.action4]: 81,
        }
    }
}

const settingsStorageKey: string = 'userSettings';
class UserSettings {
    private _settings: IUserSettings;
    Observable: Observable<IObserver<ISettingsEventArgs>, ISettingsEventArgs> = new Observable();

    constructor() {
        const stored = localStorage.getItem(settingsStorageKey);
        if (stored)
            this.SetFullSettings(JSON.parse(stored));
        else
            this.Reset();
    }

    GetSetting(setting: UserSetting): any { return this._settings[setting]; }

    SetSetting(setting: UserSetting, value: any): void {
        if (this._settings[setting] === undefined || this._settings[setting] !== value) {
            this._settings[setting] = value;
            localStorage.setItem(settingsStorageKey, JSON.stringify(this._settings));
            this.Observable.Notify({ setting: setting, newValue: value });
        }
    }

    private SetFullSettings(settings: IUserSettings): void {
        // Add any missing fields as default value
        const def = GetDefaultSettings();
        for (const key in def) {
            if (settings[key] === undefined)
                settings[key] = def[key];
        }

        this._settings = settings;
        localStorage.setItem(settingsStorageKey, JSON.stringify(this._settings));

        // Notify all the fields
        for (const key in this._settings)
            this.Observable.Notify({ setting: UserSetting[key], newValue: this._settings[key] });
    }

    Reset(): void {
        localStorage.removeItem(settingsStorageKey);
        this.SetFullSettings(GetDefaultSettings());
    }
}

/** Used to keep track of settings set by the user. Unlike Config which is for things not decided by the user. */
export const Settings = new UserSettings();