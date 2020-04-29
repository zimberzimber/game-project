export interface IUserSettings {
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
    controlsKeymap: { [key: number]: string };
}