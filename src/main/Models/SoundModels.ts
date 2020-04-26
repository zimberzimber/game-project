export class SoundOptions {
    constructor(volume: number = 1, loop: boolean = false, pan: number | null = null, tag: SoundTags = SoundTags.Default) {
        this.volume = volume;
        this.loop = loop;
        this.pan = pan;
        this.tag = tag;
    }

    volume: number = 1;
    loop: boolean = false;
    pan: number | null = null;
    tag: SoundTags = SoundTags.Default;
}

export enum SoundTags {
    Default, // Paused when the game is paused.
    Music, // Plays at a lower volume when the game is paused.
    UI // Unaffected by pausing.
}