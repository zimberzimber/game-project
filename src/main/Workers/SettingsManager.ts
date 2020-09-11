import { IUserSettings, UserSetting, ISettingsEventArgs } from "../Models/IUserSettings";
import { ControlKey } from "../Models/ControlKeys";
import { IObserver, Observable } from "../Models/Observable";

const GetDefaultSettings = (): IUserSettings => {
    return {
        [UserSetting.MasterVolume]: 1,
        [UserSetting.SfxVolume]: 1,
        [UserSetting.MusicVolume]: 1,
        [UserSetting.ControlsKeymap]: {
            [ControlKey.up]: 'KeyW',
            [ControlKey.down]: 'KeyS',
            [ControlKey.left]: 'KeyA',
            [ControlKey.right]: 'KeyD',
            [ControlKey.pause]: 'Escape',
            [ControlKey.action1]: 'Space',
            [ControlKey.action2]: 'KeyQ',
            [ControlKey.action3]: 'KeyE',
            [ControlKey.action4]: 'KeyR',
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

    GetSetting(setting: UserSetting): any {
        return typeof this._settings[setting] == 'object' ? JSON.parse(JSON.stringify(this._settings[setting])) : this._settings[setting];
    }

    SetSetting(setting: UserSetting, value: any): void {
        if (this._settings[setting] === undefined || this._settings[setting] !== value) {
            this._settings[setting] = typeof value == 'object' ? JSON.parse(JSON.stringify(value)) : value;
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