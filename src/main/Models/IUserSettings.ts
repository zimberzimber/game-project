import { IKeymap } from "./ControlKeys";
import { IObserver } from "./Observable";

export enum UserSetting { MasterVolume, SfxVolume, MusicVolume, ControlsKeymap }

/** User controller settings. */
export interface IUserSettings {
    [UserSetting.MasterVolume]: number;
    [UserSetting.SfxVolume]: number;
    [UserSetting.MusicVolume]: number;
    [UserSetting.ControlsKeymap]: IKeymap;
}

export interface ISettingsEventArgs {
    setting: UserSetting;
    newValue: any;
}

export interface ISettingsObserver extends IObserver<ISettingsEventArgs> {
    OnObservableNotified(args: ISettingsEventArgs): void;
}