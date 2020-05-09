import { IDB } from './IndexeddbManager';
import { CDN } from './CdnManager';
import { Log } from "./Logger";
import { IDBSoundDataModel } from '../Models/IndexedDbSchemas';
import { MiscUtil } from '../Utility/Misc';

class SoundManager {
    private initialized: boolean = false;
    private soundSourceStorage: ArrayBuffer[] = [];
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
                let arrayBuffer: ArrayBuffer;

                if (exists) {
                    const result = await IDB.GetData('game', 'sounds', url);
                    if (result.error) {
                        Log.Error(`Failed fetching existing sound resource from IDB: ${url}`);
                        Log.Error(result.error);
                        return;
                    }
                    else {
                        arrayBuffer = (result.data as IDBSoundDataModel).buffer;
                    }
                } else {
                    const result = await CDN.GetContentFromUrl(url);
                    if (result.error) {
                        Log.Error(`Failed fetching sound resource from url: ${url}`);
                        Log.Error(result.error);
                        return;
                    }
                    else {
                        arrayBuffer = await result.data.arrayBuffer();
                        await IDB.StoreData('game', 'sounds', new IDBSoundDataModel(url, arrayBuffer));
                    }
                }

                this.soundSourceStorage[sourceId] = arrayBuffer;
                this.soundSourceNameIndexes[sourceName] = sourceId;
            };

            promises.push(method());
        }

        // Wait for the loading to complete
        await Promise.all(promises);
        return;
    }

    GetSoundSource(id: number): ArrayBuffer | null {
        // Need a copy of the buffer so the original doesn't get detached
        return this.soundSourceStorage[id] ? MiscUtil.CopyArrayBuffer(this.soundSourceStorage[id]) : null;
    }

    GetSoundSourceByName(name: string): ArrayBuffer | null {
        return this.soundSourceNameIndexes[name] ? this.GetSoundSource(this.soundSourceNameIndexes[name]) : null;
    }
}

export const Sounds = new SoundManager();