import { IDB } from './IndexeddbManager';
import { CDN } from './CdnManager';
import PromiseUtil from '../Utility/Promises';
import { Log } from "./Logger";
import { SoundOptions, SoundTags } from '../Models/SoundModels';


interface SoundInfo {
    soundName: string;
    context: AudioContext;
    source: AudioBufferSourceNode;
    options: SoundOptions;
    nodes: {
        gain?: GainNode,
        panner?: StereoPannerNode,
    }
}

class SoundManager {
    private sounds: { [key: string]: string } = {};
    private nextSoundId: number = 0;
    private masterVolume: number = 1;
    private paused: boolean = false;
    private initialized: boolean = false;
    private volumeContainer: { [key: number]: number } = {}
    private activeSounds: { [key: number]: SoundInfo } = {};
    private silenceContext: SoundInfo;

    constructor() {
        for (let tag in SoundTags)
            if (!isNaN(Number(tag)))
                this.volumeContainer[tag] = 1;
    }

    async Initialize(soundDefinitions: { [key: string]: string }): Promise<void> {
        if (this.initialized) {
            Log.Warn('SoundManager is already initialized.');
            return;
        }
        this.initialized = true;

        this.sounds = soundDefinitions;

        // Load sounds into the database
        const promises: Promise<void>[] = [];
        for (const name in soundDefinitions) {
            const method = async (): Promise<void> => {
                const exists = await IDB.CheckExistence('game', 'sounds', soundDefinitions[name])

                if (!exists) {
                    const result = await CDN.GetContentFromUrl(soundDefinitions[name]);
                    if (result.error)
                        Log.Error(`Failed fetching sound resource from url: ${soundDefinitions[name]}`);
                    else
                        await IDB.StoreData('game', 'sounds', { url: soundDefinitions[name], blob: result.data });
                }
            };
            promises.push(method());
        }

        // Wait for the loading to complete
        await Promise.all(promises);

        // If the page did not emit any sounds for some time, it will take time before the device starts emitting sound.
        // This constant silence tricks the device into thinking it does. May not be relevant for all systems.
        // This context should not be affected by anything, as it should just loop quietly in the background like my very painful existence.
        const silenceContext = await this.GenerateSoundContext('silence', new SoundOptions(0, true, null))
        if (silenceContext == null)
            throw Error('Failed generating context for the sound of silence.');
        this.silenceContext = silenceContext;
        silenceContext.source.start(0);

        return;
    }

    GetMasterVolume(): number { return this.masterVolume; }
    SetMasterVolume(volume: number): void {
        this.masterVolume = volume;
        this.UpdateGainNodes();
    }

    GetTagVolume(tag: SoundTags): number { return this.volumeContainer[tag]; }
    SetTagVolume(tag: SoundTags, volume: number): void {
        this.volumeContainer[tag] = volume;
        this.UpdateGainNodes(tag);
    }

    private UpdateGainNodes(tag: SoundTags | null = null): void {
        if (tag === null)
            for (const i in this.activeSounds) {
                const ctx = this.activeSounds[i];
                ctx.nodes.gain?.gain.setValueAtTime(this.ContextVolume(ctx), ctx.context.currentTime);
            }
        else {
            for (const i in this.activeSounds) {
                const ctx = this.activeSounds[i];
                if (ctx.options.tag === tag)
                    ctx.nodes.gain?.gain.setValueAtTime(this.ContextVolume(ctx), ctx.context.currentTime);
            }
        }
    }

    private async GenerateSoundContext(soundName: string, options: SoundOptions): Promise<SoundInfo | null> {
        const result = await IDB.GetData('game', 'sounds', this.sounds[soundName])
        if (result.error) {
            Log.Error(`Error generating context for sound name: ${soundName}\n${result.error.message}`);
            return null;
        } else {
            //@ts-ignore (TypeScripts DOM library does not recognize webkit)
            const context = new (window.AudioContext || window.webkitAudioContext)();
            const completionPromise = PromiseUtil.CreateCompletionPromise();

            const audioData: ArrayBuffer = await result.data.blob.arrayBuffer();
            let info: SoundInfo | null = null;

            context.decodeAudioData(audioData,
                (buffer) => {
                    const source = context.createBufferSource();
                    source.buffer = buffer;
                    source.loop = options.loop || false;

                    info = { soundName, context, options, source, nodes: {} };
                    this.ConnectNodes(info);
                    completionPromise.resolve();
                },
                (e) => {
                    Log.Error(`Error decoding audio for sound name: ${soundName}\n${e.message}`);
                    completionPromise.resolve();
                }
            );

            await completionPromise.Promise;
            return info;
        }
    }

    private ConnectNodes(info: SoundInfo): void {
        // Volume
        info.nodes.gain = new GainNode(info.context, { gain: this.ContextVolume(info) });
        let nodeChain = info.source.connect(info.nodes.gain);

        // Panning
        if (info.options.pan !== null) {
            info.nodes.panner = new StereoPannerNode(info.context, { pan: info.options.pan });
            nodeChain = nodeChain.connect(info.nodes.panner);
        }

        // Destination
        nodeChain.connect(info.context.destination);
    }

    /**
     * Play a sound, and get its ID. Returns -1 if the sound was not created.
     * @param soundName The name of the sound to play
     * @param options Sound options
     */
    async PlaySound(soundName: string, options: SoundOptions | void): Promise<number> {
        const info: SoundInfo | null = await this.GenerateSoundContext(soundName, options || new SoundOptions());
        if (info === null) return -1;

        const id = this.nextSoundId;
        this.nextSoundId++;
        this.activeSounds[id] = info;
        info.source.start(0);

        // Close the context to release resources and remove its reference when the sound ended
        info.source.onended = () => {
            info.context.close().then();
            delete this.activeSounds[id];
        }

        return id;
    }

    private ContextVolume(context: SoundInfo): number {
        let volume = context.options.volume * this.masterVolume * (this.volumeContainer[context.options.tag] || this.volumeContainer[SoundTags.Default]);
        if (this.paused && context.options.tag == SoundTags.Music)
            volume *= 0.5;
        return volume;
    }

    Pause() {
        if (this.paused) return;
        this.paused = true;

        this.UpdateGainNodes(SoundTags.Music);
        for (const i in this.activeSounds)
            if (this.activeSounds[i].options.tag == SoundTags.Default)
                this.activeSounds[i].context.suspend();
    }

    Unpause() {
        if (!this.paused) return;
        this.paused = false;

        this.UpdateGainNodes(SoundTags.Music);
        for (const i in this.activeSounds)
            if (this.activeSounds[i].options.tag == SoundTags.Default)
                this.activeSounds[i].context.resume();
    }

    // Repetetive check for a sound instance. Prints a warning if it does not.
    private InstanceExists(instanceId: number): boolean {
        if (this.activeSounds[instanceId]) return true;
        Log.Warn(`Attempted to interact with nonexistence sound instance with id: ${instanceId}`);
        return false;
    }

    GetVolume(instanceId: number): number {
        if (!this.InstanceExists(instanceId)) return 0;
        return this.activeSounds[instanceId].options.volume;
    }
    SetVolume(instanceId: number, volume: number): void {
        if (!this.InstanceExists(instanceId)) return;

        const ctx = this.activeSounds[instanceId];
        ctx.options.volume = volume;
        ctx.nodes.gain?.gain.setValueAtTime(this.ContextVolume(ctx), ctx.context.currentTime);
    }

    GetPan(instanceId: number): number | null {
        if (!this.InstanceExists(instanceId)) return null;
        return this.activeSounds[instanceId].options.pan;
    }
    SetPan(instanceId: number, panning: number): void {
        if (!this.InstanceExists(instanceId)) return;

        const ctx = this.activeSounds[instanceId];
        if (ctx.options.pan === null) {
            Log.Warn(`Attempted to manipulate panning for an instance without panning. ID: ${instanceId}`);
            return;
        }

        ctx.options.pan = panning;
        ctx.nodes.panner?.pan.setValueAtTime(this.ContextVolume(ctx), ctx.context.currentTime);
    }

    GetLooping(instanceId: number): boolean {
        if (!this.InstanceExists(instanceId)) return false;
        return this.activeSounds[instanceId].options.loop;
    }
    SetLooping(instanceId: number, loop: boolean): void {
        if (!this.InstanceExists(instanceId)) return;

        const ctx = this.activeSounds[instanceId];
        ctx.options.loop = loop;
        ctx.source.loop = loop;
    }
}

export const Sounds = new SoundManager();