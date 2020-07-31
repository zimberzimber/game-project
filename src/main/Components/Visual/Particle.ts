import { ITransformEventArgs } from "../../Models/Transform";
import { Vec2 } from "../../Models/Vectors";
import { DrawDirectiveBase } from "./DrawDirectiveBase";
import { EntityBase } from "../../Entities/EntityBase";
import { IMultiFrameSpriteStorage, ISingleFrameSpriteStorage, ISpriteFrame } from "../../Models/SpriteModels";
import { Sprites } from "../../Workers/SpriteManager";
import { OneTimeLog } from "../../Workers/OneTimeLogger";
import { LogLevel } from "../../Workers/Logger";
import { Vec2Utils } from "../../Utility/Vec2";
import { ScalarUtil } from "../../Utility/Scalar";
import { IParticleDefinition, IParticleInstance, ParticleController } from "../../Models/ParticleModels";
import { particleDefinitions } from "../../AssetDefinitions/ParticleDefinitions";

export class ParticleComponent extends DrawDirectiveBase {
    private _lastEmission: number = 0;
    private _startedEmitting: number = 0;
    private _isEmitting: boolean = false;
    get IsEmitting(): boolean { return this._isEmitting; }

    private _particleData: IParticleDefinition;
    private _spriteData: IMultiFrameSpriteStorage | ISingleFrameSpriteStorage;
    private _particleInstances: IParticleInstance[] = [];

    private _particleController: ParticleController;

    get ImageId(): number { return this._spriteData.imageId; }

    private OnEndedCallback: () => void;
    set OnEnded(callback: () => void) {
        this.OnEndedCallback = callback;
    }

    constructor(parent: EntityBase, particleName: string) {
        super(parent);
        // Unsibscribe from the transform observable as its not needed.
        this.Parent.worldRelativeTransform.Unsubscribe(this);

        this._particleData = particleDefinitions[particleName];

        let sd: IMultiFrameSpriteStorage | ISingleFrameSpriteStorage | null = Sprites.GetAnimatedSpriteData(this._particleData.spriteName) || Sprites.GetStaticSpriteData(this._particleData.spriteName);

        if (sd == null) {
            OneTimeLog.Log(`no_sprite_${this._particleData.spriteName}_for_particle_${particleName}`, `${particleName} particle uses sprite ${this._particleData.spriteName} which doesn't exist.`, LogLevel.Warn);
            sd = { imageId: 0, frame: { origin: [0, 0], size: [0, 0] } };
        }

        this._spriteData = sd;
        this._particleController = new ParticleController(this._particleData, this._spriteData);
    }

    // Both of these are redundant here, as its all handled through Update regardless.
    OnObservableNotified(args: ITransformEventArgs): void { }
    protected UpdateWebglData(): void { }

    Update(delta: number) {
        super.Update(delta);
        const now = Date.now();
        let stopEmitting = false;

        if (this._isEmitting && this._particleInstances.length < this._particleData.maxParticles) {
            if (this._particleData.emissionTime && now - this._startedEmitting >= this._particleData.emissionTime * 1000) {
                stopEmitting = true;
            } else {
                const timeDifference = now - this._lastEmission;
                const msPerEmission = 1 / this._particleData.emissionRate * 1000;
                const msLeftover = timeDifference % msPerEmission;

                // This method could easily have something as small as a lag spike snowball into a full on lag fest.
                // this.Emit(Math.floor(timeDifference / msPerEmission));

                // So I resort to emitting just one instance, even if 100 instances should've been emitted because of the time difference
                if (timeDifference > msPerEmission) {
                    this.Emit();
                    this._lastEmission += timeDifference - msLeftover;
                }
            }
        }

        this._webglData = {
            attributes: [],
            indexes: []
        };

        if (this._particleInstances.length == 0) {
            if (this._isEmitting && stopEmitting) {
                this._isEmitting = false;
                if (this.OnEndedCallback)
                    this.OnEndedCallback();
            }
        } else {
            let hasDeleted = false;

            for (let i = 0; i < this._particleInstances.length; i++) {
                const inst = this._particleInstances[i];
                if (inst.lifeSpan > inst.lifeTime) {
                    inst.lifeTime += delta;
                    this._particleController.Manipulate(inst, delta);
                    this.InsertWebglDataFromInstace(inst);
                } else {
                    delete this._particleInstances[i];
                    hasDeleted = true;
                }
            }

            if (hasDeleted)
                this._particleInstances = this._particleInstances.filter(i => i);
        }
    }

    private Emit(): void {
        const inst: IParticleInstance = this._particleController.CreateInstance();

        if (!this._particleData.relativePositioning) {
            inst.position[0] += this.Parent.worldRelativeTransform.Position[0];
            inst.position[1] += this.Parent.worldRelativeTransform.Position[1];
        }

        this._particleInstances.push(inst);
    }

    private InsertWebglDataFromInstace(inst: IParticleInstance): void {
        const trans = this.Parent.worldRelativeTransform;
        // Looks prettier when compiled
        const frame: ISpriteFrame = (this._spriteData as IMultiFrameSpriteStorage).frames ? (this._spriteData as IMultiFrameSpriteStorage).frames[inst.frame] : (this._spriteData as ISingleFrameSpriteStorage).frame || { origin: [0, 0], size: [0, 0] };

        const origin: Vec2 = [inst.position[0], inst.position[1]];
        if (this._particleData.relativePositioning) {
            origin[0] += trans.Position[0];
            origin[1] += trans.Position[1];
        }

        const widthHalf = inst.size[0] * inst.sizeMultiplier / 2;
        const heightHalf = inst.size[1] * inst.sizeMultiplier / 2;
        let coords: Vec2[] = [
            [origin[0] + widthHalf, inst.position[1] + heightHalf],
            [origin[0] - widthHalf, inst.position[1] + heightHalf],
            [origin[0] - widthHalf, inst.position[1] - heightHalf],
            [origin[0] + widthHalf, inst.position[1] - heightHalf],
        ];

        // Using Vec2 utils here because its a bit more complex
        if (inst.rotation) {
            const rad = ScalarUtil.ToRadian(inst.rotation);
            for (let i = 0; i < coords.length; i++)
                coords[i] = Vec2Utils.RotatePointAroundCenter(coords[i], rad, origin);
        }

        this._webglData.attributes.push(
            coords[0][0], coords[0][1], trans.Depth, frame.origin[0] + frame.size[0], frame.origin[1],
            coords[1][0], coords[1][1], trans.Depth, frame.origin[0], frame.origin[1],
            coords[2][0], coords[2][1], trans.Depth, frame.origin[0], frame.origin[1] + frame.size[1],
            coords[3][0], coords[3][1], trans.Depth, frame.origin[0] + frame.size[0], frame.origin[1] + frame.size[1],
        );

        const index = this._webglData.indexes.length > 0 ? this._webglData.indexes[this._webglData.indexes.length - 1] + 1 : 0
        this._webglData.indexes.push(
            index, index + 1, index + 2,
            index, index + 2, index + 3
        );
    }

    Start(): void {
        this._lastEmission = Date.now();
        this._startedEmitting = this._lastEmission;
        this._isEmitting = true;
    }

    Stop(): void {
        this._isEmitting = false;
    }

    Burst(): void {
        const count = this._particleData.maxParticles - this._particleInstances.length;
        for (let i = 0; i < count; i++)
            this.Emit();
    }
}