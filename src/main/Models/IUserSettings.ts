import { IKeymap } from "./ControlKeys";

/** User controller settings. */
export interface IUserSettings {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    controlsKeymap: IKeymap;
}