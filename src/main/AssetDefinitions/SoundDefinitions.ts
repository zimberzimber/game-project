import { ISoundDefinition, SoundType } from "../Models/SoundModels";

export const SoundDefinitions: { [key: string]: ISoundDefinition } = {
    loop: {
        soundSourceName: 'loop',
        volume: 0.5,
        playbackRate: 1,
        loop: true,
        type: SoundType.Music,
        falloffStartDistance: 100,
        falloffDistance: 200
    },
    loop2: {
        soundSourceName: 'loop2',
        volume: 0.1,
        playbackRate: 1,
        loop: true,
        type: SoundType.Music,
        falloffStartDistance: 0,
        falloffDistance: 0
    },
    ui: {
        soundSourceName: 'ui',
        volume: 1,
        playbackRate: 1,
        loop: false,
        type: SoundType.UI,
        falloffStartDistance: 0,
        falloffDistance: 0
    },
    sfx: {
        soundSourceName: 'sfx',
        volume: 1,
        playbackRate: 1,
        loop: false,
        type: SoundType.Default,
        falloffStartDistance: 200,
        falloffDistance: 600
    },
}

export const ImpulseDefinitions: { [key: string]: string } = {
    cave: 'impulse_cathedral'
}