import { ISoundDefinition, SoundType } from "../Models/SoundModels";

export const SoundDefinitions: { [key: string]: ISoundDefinition } = {
    silence: {
        soundSourceName: 'silence',
        volume: 0,
        playbackRate: 1,
        loop: true,
        type: SoundType.Music
    },

    // SFX
    item_key: {
        soundSourceName: 'item_key',
        volume: 1,
        playbackRate: 1,
        loop: false,
        type: SoundType.Default,
        falloffStartDistance: 200,
        falloffDistance: 600
    },
    ui_accept: {
        soundSourceName: 'ui_accept',
        volume: 1,
        playbackRate: 1,
        loop: false,
        type: SoundType.UI
    },
    
    ui_button_click: {
        soundSourceName: 'item_key',
        volume: 1,
        playbackRate: 1,
        loop: false,
        type: SoundType.UI
    },
    ui_button_hover: {
        soundSourceName: 'ui_tick',
        volume: 1,
        playbackRate: 1,
        loop: false,
        type: SoundType.UI
    },

    // Music
    music_game: {
        soundSourceName: 'music_game',
        volume: 1,
        playbackRate: 1,
        loop: true,
        type: SoundType.Music
    },
    music_main: {
        soundSourceName: 'music_main',
        volume: 1,
        playbackRate: 1,
        loop: true,
        type: SoundType.Music
    }
}

export const ImpulseDefinitions: { [key: string]: string } = {
    cave: 'impulse_cathedral'
}