import { EntityBase } from "../../Entities/EntityBase";
import { ComponentBase } from "../ComponentBase";
import { DrawDirectiveAnimatedImage } from "../Visual/DrawDirectiveAnimatedImage";

abstract class BaseTimerComponent extends ComponentBase {
    private _time: number;
    private _countdown: number;
    private _running: boolean;
    get IsRunning(): boolean { return this._running; }

    protected _autoRestart: boolean = false;

    constructor(parent: EntityBase, time: number, autoRestart: boolean) {
        super(parent);
        this._time = time;
        this._countdown = time;
        this._autoRestart = autoRestart;
    }

    Start(): void {
        this._running = true;
    }

    Stop(): void {
        this._countdown = this._time;
        this._running = false;
    }

    Restart(): void {
        this._countdown = this._time;
        this.Start();
    }

    protected abstract OnTimesUp(): void;

    Update(delta: number) {
        super.Update(delta);

        if (this._running) {
            this._countdown -= delta;
            if (this._countdown <= 0) {
                if (this._autoRestart)
                    this._countdown = this._time;
                else
                    this._running = false;
                this.OnTimesUp();
            }
        }
    }
}

export class TimerComponent extends BaseTimerComponent {
    private _timesUpCallback?: () => void;
    set OnTimesUpCallback(callback: null | (() => void)) {
        if (callback)
            this._timesUpCallback = callback;
        else
            delete this._timesUpCallback;
    }

    protected OnTimesUp(): void {
        if (this._timesUpCallback)
            this._timesUpCallback();
    }

    Unitialize() {
        delete this._timesUpCallback;
        super.Unitialize();
    }
}

export class SimpleAnimatorComponent extends BaseTimerComponent {
    private _currentFrame: number = 0;
    private _frameCount: number;
    private _dd: DrawDirectiveAnimatedImage;
    private _loopAnimation: boolean;

    constructor(parent: EntityBase, time: number, loopAnimation: boolean, drawDirective: DrawDirectiveAnimatedImage, frameCount: number) {
        super(parent, time, true);
        this._frameCount = frameCount;
        this._dd = drawDirective;
        this._loopAnimation = loopAnimation;
    }

    protected OnTimesUp(): void {
        if (this._loopAnimation) {
            this._currentFrame = (this._currentFrame + 1) % this._frameCount;
            this._dd.Frame = this._currentFrame;
        } else {
            if (this._currentFrame < this._frameCount) {
                this._currentFrame++;
                this._dd.Frame = this._currentFrame;
            } else
                this.Stop();
        }
    }

    Restart(): void {
        this._currentFrame = 0;
        this._dd.Frame = 0;
        super.Restart();
    }
}