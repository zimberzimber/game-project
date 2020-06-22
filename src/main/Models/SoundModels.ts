export enum SoundType {
    Default, // Paused when the game is paused
    Music, // Plays at a lower volume when the game is paused.
    UI // Unaffected by pausing.
}

interface ISoundBase {
    loop: boolean;
    type: SoundType;
    playbackRate: number;
}

export interface IActiveSound extends ISoundBase {
    sourceSoundId: number;
    sourceName: string,
    sourceNode: AudioBufferSourceNode;
    gainNode: GainNode;
    panNode: StereoPannerNode;
}

export interface ISoundDefinition extends ISoundBase {
    soundSourceName: string;
    volume: number;
    falloffStartDistance: number;
    falloffDistance: number;
}

export enum ControllerType {
    Volume, Pan, Playback
}

export interface ISoundplayerIndividualCallback { (soundId: number): void; }

export interface ISoundplayerMasterCallback { (): void; }