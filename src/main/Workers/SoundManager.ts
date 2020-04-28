import { IDB } from './IndexeddbManager';
import { CDN } from './CdnManager';
import { Log } from "./Logger";

class SoundManager {
    private initialized: boolean = false;
    private soundSourceStorage: Blob[] = [];
    private soundSourceNameIndexes: { [key: string]: number } = {};

    async Initialize(soundSourceDefinitions: { [key: string]: string }): Promise<void> {
        if (this.initialized) {
            Log.Warn('SoundManager is already initialized.');
            return;
        }
        this.initialized = true;

        let nextId = 0;
        const promises: Promise<void>[] = [];
        for (const sourceName in soundSourceDefinitions) {
            const url = soundSourceDefinitions[sourceName];
            const sourceId = nextId++;

            const method = async (): Promise<void> => {
                const exists = await IDB.CheckExistence('game', 'sounds', url)
                let blob: Blob;

                if (exists) {
                    const result = await IDB.GetData('game', 'sounds', url);
                    if (result.error) {
                        Log.Error(`Failed fetching existing sound resource from IDB: ${url}`);
                        Log.Error(result.error);
                        return;
                    }
                    else {
                        blob = result.data.blob;
                    }
                } else {
                    const result = await CDN.GetContentFromUrl(url);
                    if (result.error) {
                        Log.Error(`Failed fetching sound resource from url: ${url}`);
                        Log.Error(result.error);
                        return;
                    }
                    else {
                        await IDB.StoreData('game', 'sounds', { url: url, blob: result.data });
                        blob = result.data;
                    }
                }

                this.soundSourceStorage[sourceId] = blob;
                this.soundSourceNameIndexes[sourceName] = sourceId;
            };

            promises.push(method());
        }

        // Wait for the loading to complete
        await Promise.all(promises);
        return;
    }

    GetSoundSource(id: number): Blob | null {
        return this.soundSourceStorage[id] ? this.soundSourceStorage[id] : null;
    }

    GetSoundSourceByName(name: string): Blob | null {
        return this.soundSourceNameIndexes[name] ? this.GetSoundSource(this.soundSourceNameIndexes[name]) : null;
    }
}

export const Sounds = new SoundManager();