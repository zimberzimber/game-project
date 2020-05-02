import { LogLevel } from "./Logger";
import { SoundTags, IActiveSound, ISoundDefinition, ControllerType, ISoundplayerMasterCallback, ISoundplayerIndividualCallback } from '../Models/SoundModels';
import { OneTimeLog } from './OneTimeLogger';
import { Sounds } from './SoundManager';
import { CDN } from "./CdnManager";
import { ScalarUtil } from "../Utility/Scalar";

class SoundPlayer {
    private nextSoundId: number = 0;
    private activeSoundIds: number[] = [];
    private activeSounds: IActiveSound[] = [];

    private context: AudioContext;

    private nodeConnectionPoint: AudioNode;
    private masterGainNode: GainNode;
    private masterPanNode: StereoPannerNode;
    private masterPlaybackRate: number = 1;
    private masterConvolver: ConvolverNode;

    private convolverConnected: boolean = false;
    private tagGainNodes: { [key: number]: GainNode; } = {};

    constructor() {
        //@ts-ignore TypeScript does not recognize Webkit
        this.context = new (window.AudioContext || window.webkitAudioContext)();

        this.masterGainNode = this.context.createGain();
        this.masterPanNode = this.context.createStereoPanner();
        this.masterConvolver = this.context.createConvolver();

        this.masterGainNode.gain.value = 1;
        this.masterPanNode.pan.value = 0;

        this.masterPanNode.connect(this.masterGainNode).connect(this.context.destination);
        this.nodeConnectionPoint = this.masterPanNode;

        for (let tag in SoundTags)
            if (!isNaN(Number(tag))) {
                this.tagGainNodes[tag] = this.context.createGain();
                this.tagGainNodes[tag].connect(this.nodeConnectionPoint);
                this.tagGainNodes[tag].gain.value = 1;
            }
    }

    SetConvolverImpulse(soundName: string): void {
        const blob = Sounds.GetSoundSourceByName(soundName);
        if (!blob) {
            OneTimeLog.Log(`soundPlayer_failedLoading_${soundName}`, `Failed retrieving sound named '${soundName}' from sound manager.`, LogLevel.Error);
            return;
        }

        blob.arrayBuffer().then((audioArray: ArrayBuffer) => {
            this.context.decodeAudioData(audioArray, (buffer) => {
                this.masterConvolver.buffer = buffer;
                if (!this.convolverConnected) {
                    this.masterGainNode.connect(this.masterConvolver).connect(this.context.destination);
                    this.convolverConnected = true;
                }
            });
        });
    }

    RemoveConvolverImpulse(): void {
        if (this.convolverConnected) {
            this.convolverConnected = false;
            this.masterConvolver.disconnect(this.context.destination);
            this.masterGainNode.disconnect(this.masterConvolver);
        }
    }

    StopSound(id: number): void {
        if (!this.IsActive(id)) return;
        this.activeSounds[id].sourceNode.stop(0);
    }

    PlaySound(config: ISoundDefinition): number {
        const blob = Sounds.GetSoundSourceByName(config.soundSourceName);
        if (!blob) {
            OneTimeLog.Log(`soundPlayer_failedLoading_${config.soundSourceName}`, `Failed retrieving sound named '${config.soundSourceName}' from sound manager.`, LogLevel.Error);
            return -1;
        }

        const id = this.nextSoundId++;
        const source = this.context.createBufferSource();
        const gain = this.context.createGain();
        const pan = this.context.createStereoPanner();

        const acttivityInfo: IActiveSound = {
            sourceSoundId: id,
            sourceNode: source,
            gainNode: gain,
            panNode: pan,
            playbackRate: config.playbackRate,
            looping: config.loop,
            tag: config.tag
        };

        gain.gain.value = config.volume;
        source.loop = config.loop;
        this.UpdatePlaybackRate(acttivityInfo);

        this.activeSoundIds.push(id);
        this.activeSounds[id] = acttivityInfo;

        blob.arrayBuffer().then((audioArray: ArrayBuffer) => {
            this.context.decodeAudioData(audioArray, (buffer) => {
                source.buffer = buffer;
                source.start(0);
                source.onended = () => this.DisposeSound(id);
            });
        });

        source.connect(pan);
        pan.connect(gain);
        gain.connect(this.tagGainNodes[config.tag]);

        return id;
    }

    GetMasterControllerValue(controller: ControllerType): number {
        switch (controller) {
            case ControllerType.Volume:
                return this.masterGainNode.gain.value;
            case ControllerType.Pan:
                return this.masterPanNode.pan.value;
            case ControllerType.Playback:
                return this.masterPlaybackRate;
        }
    }

    SetMasterControllerValue(controller: ControllerType, value: number): void {
        switch (controller) {
            case ControllerType.Volume:
                this.masterGainNode.gain.value = value;
                return;
            case ControllerType.Pan:
                this.masterPanNode.pan.value = value;
                return;
            case ControllerType.Playback: {
                this.masterPlaybackRate = value;
                for (let i = 0; i < this.activeSoundIds.length; i++)
                    this.UpdatePlaybackRate(this.activeSounds[this.activeSoundIds[i]]);
                return;
            }
        }
    }

    GetTagVolume(tag: SoundTags): number {
        return this.tagGainNodes[tag].gain.value;
    }

    SetTagVolume(tag: SoundTags, volume: number) {
        this.tagGainNodes[tag].gain.value = volume;
    }

    GetControllerValueForSound(soundId: number, controller: ControllerType): number {
        if (!this.IsActive(soundId)) return 0;

        switch (controller) {
            case ControllerType.Volume:
                return this.activeSounds[soundId].gainNode.gain.value;
            case ControllerType.Pan:
                return this.activeSounds[soundId].panNode.pan.value;
            case ControllerType.Playback:
                return this.activeSounds[soundId].playbackRate;
        }
    }

    SetControllerValueForSound(soundId: number, controller: ControllerType, value: number): void {
        if (!this.IsActive(soundId)) return;

        switch (controller) {
            case ControllerType.Volume:
                this.activeSounds[soundId].gainNode.gain.value = value;
                return;
            case ControllerType.Pan:
                this.activeSounds[soundId].panNode.pan.value = value;
                return;
            case ControllerType.Playback:
                this.activeSounds[soundId].playbackRate = value;
                this.UpdatePlaybackRate(this.activeSounds[soundId]);
                return;
        }
    }

    GetLooping(soundId: number): boolean {
        if (!this.IsActive(soundId)) return false;

        return this.activeSounds[soundId].sourceNode.loop;
    }

    SetLooping(soundId: number, value: boolean): void {
        if (!this.IsActive(soundId)) return;

        this.activeSounds[soundId].sourceNode.loop = value;
    }

    private IsActive(id: number): boolean {
        if (this.activeSounds[id]) return true;

        OneTimeLog.Log(`inactive_sound_%{id}`, `Attempted to interact with inactive sound ID: ${id}`, LogLevel.Error);
        return false;
    }

    private UpdatePlaybackRate(activeSound: IActiveSound): void {
        activeSound.sourceNode.playbackRate.value = activeSound.playbackRate * this.masterPlaybackRate;
    }

    private DisposeSound(id: number): void {
        if (!this.IsActive(id)) return;

        this.activeSounds[id].sourceNode.loop = false;
        this.activeSounds[id].sourceNode.disconnect();
        this.activeSounds[id].panNode.disconnect();
        this.activeSounds[id].gainNode.disconnect();

        delete this.activeSounds[id];
        const index = this.activeSoundIds.indexOf(id, 0);
        if (index > -1)
            this.activeSoundIds.splice(index, 1);
    }

    ////////////////////////////////////////
    // Effects
    ////////////////////////////////////////

    FadeInOutPlaybackRate(minimalRate: number, duration: number, endRate: number = this.masterPlaybackRate, callback: ISoundplayerMasterCallback | void): void {
        if (duration <= 0) return;
        minimalRate = ScalarUtil.Clamp(0, minimalRate, 1);

        duration *= 1000;
        let ratePivot = this.masterPlaybackRate;
        let last = performance.now();
        let elapsed = 0

        const func = () => {
            const now = performance.now();
            elapsed += now - last;
            last = now;

            if (elapsed >= duration) {
                this.SetMasterControllerValue(ControllerType.Playback, endRate);
                if (callback) callback();
            } else {
                requestAnimationFrame(func);

                if (elapsed >= duration / 2)
                    ratePivot = endRate;

                this.SetMasterControllerValue(ControllerType.Playback, ((1 - minimalRate) * (Math.abs((elapsed - duration / 2) ^ 2) / (duration / 2)) + minimalRate) * ratePivot);

                // Formula:
                // let time = elapsed - duration / 2
                // let frac = Math.abs(time ^ 2) / (duration / 2)
                // let rate = ((1 - minimalRate) * frac + minimalRate) * normalRate
            }
        }
        requestAnimationFrame(func.bind(this));
    }

    FadeMasterVolume(volume: number, duration: number, callback: ISoundplayerMasterCallback | void): void {
        this.masterGainNode.gain.setValueCurveAtTime([this.masterGainNode.gain.value, volume], 0, duration);
        if (callback) setTimeout(callback, duration * 1000);
    }

    FadeVolumeForSound(soundId: number, volume: number, duration: number, callback: ISoundplayerIndividualCallback | void): void {
        if (!this.IsActive(soundId)) return;
        this.activeSounds[soundId].gainNode.gain.setValueCurveAtTime([this.activeSounds[soundId].gainNode.gain.value, volume], 0, duration)
        if (callback) setTimeout(callback, duration * 1000, soundId);
    }
}

export const Audio = new SoundPlayer();