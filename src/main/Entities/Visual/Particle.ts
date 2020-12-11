import { TimerComponent } from "../../Components/Mechanics/TimerComponent";
import { ParticleComponent } from "../../Components/Visual/Particle";
import { IGenericCallback } from "../../Models/GenericInterfaces";
import { GameEntityBase, UiEntityBase } from "../EntityBase";

export class ParticleFireAndForgetEntity extends GameEntityBase {
    private _particle: ParticleComponent;
    constructor(particle: string, customMaxDuration?: number) {
        super();
        this._particle = new ParticleComponent(this, particle);
        this.OnEnded = null; // Set default OnEnded behavior

        if (customMaxDuration) {
            const timer = new TimerComponent(this, customMaxDuration, false);
            timer.OnTimesUpCallback = () => this.Stop();
            timer.Start();
        }
    }

    Start(): void { this._particle.Start(); }
    Stop(): void { this._particle.Stop(); }
    Burst(): void { this._particle.Burst(); }

    set OnEnded(callback: null | IGenericCallback) {
        if (callback)
            this._particle.OnEnded = () => {
                callback();
                this.Delete();
            };
        else
            this._particle.OnEnded = () => this.Delete();
    }
}

export class ParticleFireAndForgetUiEntity extends UiEntityBase {
    private _particle: ParticleComponent;
    constructor(particle: string, customMaxDuration?: number) {
        super();
        this._particle = new ParticleComponent(this, particle);
        this.OnEnded = null; // Set default OnEnded behavior

        if (customMaxDuration) {
            const timer = new TimerComponent(this, customMaxDuration, false);
            timer.OnTimesUpCallback = () => this.Stop();
            timer.Start();
        }
    }

    Start(): void { this._particle.Start(); }
    Stop(): void { this._particle.Stop(); }
    Burst(): void { this._particle.Burst(); }

    set OnEnded(callback: null | IGenericCallback) {
        if (callback)
            this._particle.OnEnded = () => {
                callback();
                this.Delete();
            };
        else
            this._particle.OnEnded = () => this.Delete();
    }
}