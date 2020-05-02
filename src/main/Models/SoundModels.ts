export enum SoundTags {
    Default, // Paused when the game is paused.
    Music, // Plays at a lower volume when the game is paused.
    UI // Unaffected by pausing.
}

export interface IActiveSound {
    sourceSoundId: number;
    sourceNode: AudioBufferSourceNode;
    gainNode: GainNode;
    panNode: StereoPannerNode;
    tag: SoundTags;

    // Stored separetly as there are no nodes for these control, and to affect that the source has to be modified
    playbackRate: number;
    looping: boolean;
}

export interface ISoundDefinition {
    soundSourceName: string;
    volume: number;
    playbackRate: number;
    loop: boolean;
    tag: SoundTags;
}

export enum ControllerType {
    Volume, Pan, Playback
}

export interface ISoundplayerIndividualCallback { (soundId: number): void; }

export interface ISoundplayerMasterCallback { (): void; }