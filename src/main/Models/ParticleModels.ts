import { Vec2 } from "./Vectors";
import { ISingleFrameSpriteStorage, IMultiFrameSpriteStorage } from "./SpriteModels";
import { Vec2Utils } from "../Utility/Vec2";
import { ScalarUtil } from "../Utility/Scalar";

export interface IParticleDefinition {
    // Initialization
    spriteName: string;
    lifeSpan: number | [number, number];
    size: Vec2;
    sizeMultiplier?: number | [number, number];

    frameDuration?: number;
    loopFrames?: boolean;

    spawnRadius?: number;
    spawnBox?: [Vec2, Vec2];

    emissionAngle?: number | [number, number];
    emissionForce?: number | [number, number];
    relativePositioning?: boolean;
    initialRotation?: number | [number, number];

    // Ongoing
    emissionRate: number;
    emissionTime?: number;
    maxParticles: number;

    rotationSpeed?: number;
    forceResistence?: number;
    gravity?: Vec2;
    sizeGrowth?: number;
}

export interface IParticleInstance {
    // Component driven
    rotation: number;
    size: Vec2;
    sizeMultiplier: number;
    lifeTime: number;
    lifeSpan: number;

    // Frame manipulator
    frame: number;
    frameTime: number;

    // Position manipulator
    position: Vec2;
    force: Vec2;
}

export class ParticleController {
    private _chain: IParticleManipulator[] = [];
    private _def: IParticleDefinition;

    constructor(definition: IParticleDefinition, spriteData: ISingleFrameSpriteStorage | IMultiFrameSpriteStorage) {
        this._def = definition;

        if (definition.frameDuration && definition.frameDuration > 0) {
            let frameCount = 1;
            if ((spriteData as IMultiFrameSpriteStorage).frames)
                frameCount = (spriteData as IMultiFrameSpriteStorage).frames.length;

            if (frameCount > 1)
                this._chain.push(new ParticleManipulatorFrames(frameCount, definition.frameDuration, definition.loopFrames || true));
        }

        this._chain.push(new ParticleManipulatorPositionRotation(definition.rotationSpeed || 0));

        if (definition.forceResistence || (definition.gravity && (definition.gravity[0] || definition.gravity[1])))
            this._chain.push(new ParticleManipulatorForceChange(definition.forceResistence || 0, definition.gravity || [0, 0]))

        if (definition.sizeGrowth)
            this._chain.push(new ParticleManipulatorSizeGrowth(definition.sizeGrowth));
    }

    Manipulate(instance: IParticleInstance, delta: number): void {
        for (const manipulator of this._chain)
            manipulator.Manipulate(instance, delta);
    }

    CreateInstance(): IParticleInstance {
        const inst: IParticleInstance = {
            rotation: ScalarUtil.OneOrRange(this._def.initialRotation || 0),
            size: Vec2Utils.Copy(this._def.size),
            sizeMultiplier: ScalarUtil.OneOrRange(this._def.sizeMultiplier || 1),
            lifeSpan: ScalarUtil.OneOrRange(this._def.lifeSpan),
            lifeTime: 0,

            frame: 0,
            frameTime: 0,

            position: [0, 0],
            force: [ScalarUtil.OneOrRange(this._def.emissionForce || 0), 0],
        };

        if (this._def.spawnRadius)
            inst.position = Vec2Utils.RandomPointInCircle(this._def.spawnRadius);
        else if (this._def.spawnBox)
            inst.position = Vec2Utils.RandomPointInBox(...this._def.spawnBox);

        if (inst.force[0] && this._def.emissionAngle)
            inst.force = Vec2Utils.RotatePoint(inst.force, ScalarUtil.ToRadian(ScalarUtil.OneOrRange(this._def.emissionAngle)));

        return inst;
    }
}

interface IParticleManipulator {
    Manipulate(instance: IParticleInstance, delta: number): void;
}

class ParticleManipulatorFrames implements IParticleManipulator {
    private _frameCount: number;
    private _frameTime: number;
    private _loop: boolean;

    constructor(frameCount: number, frameTime: number, loop: boolean) {
        this._frameCount = frameCount;
        this._frameTime = frameTime;
    }

    Manipulate(instance: IParticleInstance, delta: number): void {
        if (this._loop || instance.frame < this._frameCount) {
            instance.frameTime += delta;
            if (instance.frameTime > this._frameTime) {
                instance.frameTime = 0;
                instance.frame = (instance.frame + 1) % this._frameCount;
            }
        }
    }
}

class ParticleManipulatorPositionRotation implements IParticleManipulator {
    private _rotationSpeed: number;

    constructor(rotationSpeed: number) {
        this._rotationSpeed = rotationSpeed;
    }

    Manipulate(instance: IParticleInstance, delta: number): void {
        instance.position[0] += instance.force[0] * delta;
        instance.position[1] += instance.force[1] * delta;
        instance.rotation += this._rotationSpeed * delta;
    }
}

class ParticleManipulatorForceChange implements IParticleManipulator {
    private _forceResistence: number;
    private _gravity: Vec2;

    constructor(forceResistence: number, gravity: Vec2) {
        this._forceResistence = forceResistence;
        this._gravity = gravity;
    }

    Manipulate(instance: IParticleInstance, delta: number): void {
        // Not using Vec2Utils because this will be used a lot, and should be as fast as possible.
        const forceResist = 1 - this._forceResistence * delta;
        instance.force[0] = instance.force[0] * forceResist + this._gravity[0] * forceResist;
        instance.force[1] = instance.force[1] * forceResist + this._gravity[1] * forceResist;
    }
}

class ParticleManipulatorSizeGrowth implements IParticleManipulator {
    private _growth: number = 0;

    constructor(growth: number) {
        this._growth = growth;
    }

    Manipulate(instance: IParticleInstance, delta: number): void {
        instance.sizeMultiplier = Math.max(instance.sizeMultiplier + this._growth * delta, 0);
    }
}