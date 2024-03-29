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
import { Camera } from "../../Workers/CameraManager";

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

    private _isTranslucent: boolean;
    get IsTranslucent(): boolean { return this._isTranslucent; }

    private OnEndedCallback: () => void;
    set OnEnded(callback: () => void) {
        this.OnEndedCallback = callback;
    }

    constructor(parent: EntityBase, particleName: string) {
        super(parent);
        // Unsibscribe from the transform observable as its not needed.
        this.Parent.WorldRelativeTransform.Unsubscribe(this);

        this._particleData = particleDefinitions[particleName];

        let sd: IMultiFrameSpriteStorage | ISingleFrameSpriteStorage | null = Sprites.GetAnimatedSpriteDataNoWarning(this._particleData.spriteName) || Sprites.GetStaticSpriteDataNoWarning(this._particleData.spriteName);

        if (sd == null) {
            OneTimeLog.Log(`no_sprite_${this._particleData.spriteName}_for_particle_${particleName}`, `${particleName} particle uses sprite ${this._particleData.spriteName} which doesn't exist.`, LogLevel.Warn);
            sd = { imageId: 0, frame: { origin: [0, 0], size: [0, 0] }, isTranslucent: false };
        }

        this._spriteData = sd;
        this._particleController = new ParticleController(this._particleData, this._spriteData);

        // Was curious how it would look as one line. Result was funny to me.
        const pd = this._particleData;
        this._isTranslucent = !pd ? false : (sd.isTranslucent ? true : (pd.opacity !== undefined && pd.opacity < 1 ? true : (pd.fadeInTime || pd.fadeOutStartTime !== undefined) ? true : false));

        // if (this._particleData) {
        //     if (sd.isTranslucent)
        //         this._isTranslucent = true;
        //     else {
        //         if (this._particleData.opacity !== undefined && this._particleData.opacity < 1)
        //             this._isTranslucent = true;
        //         else if (this._particleData.fadeInTime || this._particleData.fadeOutStartTime !== undefined)
        //             this._isTranslucent = true;
        //         else
        //             this._isTranslucent = false;
        //     }
        // } else
        //     this._isTranslucent = false;
    }

    // Both of these are redundant here, as its all handled through Update regardless.
    OnObservableNotified(args: ITransformEventArgs): void { }
    protected UpdateWebglData(): void { }

    Update(delta: number) {
        super.Update(delta);
        const now = Date.now();
        let stopEmitting = false;

        this._boundingRadius = 0;

        if (this._isEmitting && this._particleInstances.length < this._particleData.maxParticles) {
            if (this._particleData.emissionTime && now - this._startedEmitting >= this._particleData.emissionTime * 1000) {
                stopEmitting = true;
            } else {
                // This could easily have something as small as a lag spike snowball into a full on lag fest, so I'm hard capping it to 15 per tick.
                // This means emissionRate is indirectly capped at 450 at 60 fps
                const count = Math.min(Math.floor(this._particleData.emissionRate * 0.001 * (now - this._lastEmission)), 15);
                if (count > 0) {
                    this._lastEmission = now;
                    for (let i = 0; i < count; i++)
                        this.Emit();
                }
            }
        }

        this._webglData = {
            attributes: [],
            indexes: []
        };

        if (this._particleInstances.length == 0) {
            if (this._isEmitting && stopEmitting)
                this._isEmitting = false;

            if (!this._isEmitting && this.OnEndedCallback)
                this.OnEndedCallback();

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
        
        inst.position = Vec2Utils.Sum(inst.position, this._drawOffset);

        if (!this._particleData.relativePositioning)
            inst.position = Vec2Utils.Sum(inst.position, this.Parent.WorldRelativeTransform.Position);

        this._particleInstances.push(inst);
    }

    private InsertWebglDataFromInstace(inst: IParticleInstance): void {
        const trans = this.Parent.WorldRelativeTransform;
        // Looks prettier when compiled
        const frame: ISpriteFrame = (this._spriteData as IMultiFrameSpriteStorage).frames ? (this._spriteData as IMultiFrameSpriteStorage).frames[inst.frame] : (this._spriteData as ISingleFrameSpriteStorage).frame || { origin: [0, 0], size: [0, 0] };

        const origin: Vec2 = [inst.position[0], inst.position[1]];
        if (this._particleData.relativePositioning) {
            origin[0] += trans.Position[0];
            origin[1] += trans.Position[1];
        }

        const widthHalf = inst.size[0] * inst.sizeMultiplier / 2;
        const heightHalf = inst.size[1] * inst.sizeMultiplier / 2;
        const instanceBoundingRadius = ScalarUtil.DiagonalLength(widthHalf, heightHalf);

        // Don't process the instance if its not in view
        if (!Camera.IsInView(origin, instanceBoundingRadius)) return;

        let coords: Vec2[] = [
            [origin[0] + widthHalf, origin[1] + heightHalf],
            [origin[0] - widthHalf, origin[1] + heightHalf],
            [origin[0] - widthHalf, origin[1] - heightHalf],
            [origin[0] + widthHalf, origin[1] - heightHalf],
        ];

        // Using Vec2 utils here because the operation is a bit more complex
        if (inst.rotation) {
            const rad = ScalarUtil.ToRadian(inst.rotation);
            for (let i = 0; i < coords.length; i++)
                coords[i] = Vec2Utils.RotatePointAroundCenter(coords[i], rad, origin);
        }

        const op = inst.actualOpacity * this._opacity;
        this._webglData.attributes.push(
            coords[0][0] + this._drawOffset[0], coords[0][1] + this._drawOffset[1], trans.Depth + this._depthOffset, frame.origin[0] + frame.size[0], frame.origin[1], op,
            coords[1][0] + this._drawOffset[0], coords[1][1] + this._drawOffset[1], trans.Depth + this._depthOffset, frame.origin[0], frame.origin[1], op,
            coords[2][0] + this._drawOffset[0], coords[2][1] + this._drawOffset[1], trans.Depth + this._depthOffset, frame.origin[0], frame.origin[1] + frame.size[1], op,
            coords[3][0] + this._drawOffset[0], coords[3][1] + this._drawOffset[1], trans.Depth + this._depthOffset, frame.origin[0] + frame.size[0], frame.origin[1] + frame.size[1], op,
        );

        const index = this._webglData.indexes.length > 0 ? this._webglData.indexes[this._webglData.indexes.length - 1] + 1 : 0
        this._webglData.indexes.push(
            index, index + 1, index + 2,
            index, index + 2, index + 3
        );

        const boundingRadius = Vec2Utils.Distance(origin, this.Parent.Transform.Position) + instanceBoundingRadius;
        if (this._boundingRadius < boundingRadius)
            this._boundingRadius = boundingRadius;
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
        const count = this._particleData.maxParticles;
        for (let i = 0; i < count; i++)
            this.Emit();
    }
}