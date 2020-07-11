import { Log } from "./Logger";
import { MiscUtil } from '../Utility/Misc';

class SoundManager {
    private initialized: boolean = false;
    private soundSourceStorage: ArrayBuffer[] = [];
    private soundSourceNameIndexes: { [key: string]: number } = {};

    Initialize(soundSourceDefinitions: { [key: string]: ArrayBuffer }): void {
        if (this.initialized) {
            Log.Warn('SoundManager is already initialized.');
            return;
        }
        this.initialized = true;

        let nextId = 0;
        for (const sourceName in soundSourceDefinitions) {
            this.soundSourceStorage[nextId] = soundSourceDefinitions[sourceName];
            this.soundSourceNameIndexes[sourceName] = nextId;
            nextId++;
        }
    }

    GetSoundSource(id: number): ArrayBuffer | null {
        // Need a copy of the buffer so the original doesn't get detached
        return this.soundSourceStorage[id] ? MiscUtil.CopyArrayBuffer(this.soundSourceStorage[id]) : null;
    }

    GetSoundSourceByName(name: string): ArrayBuffer | null {
        return this.soundSourceNameIndexes[name] !== undefined ? this.GetSoundSource(this.soundSourceNameIndexes[name]) : null;
    }
}

export const Sounds = new SoundManager();