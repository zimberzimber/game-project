import { HitboxBase } from "../../Components/Hitboxes/HitboxBase";
import { HitboxCircle } from "../../Components/Hitboxes/HitboxCircle";
import { HitboxPolygon } from "../../Components/Hitboxes/HitboxPolygon";
import { HitboxRectangle } from "../../Components/Hitboxes/HitboxRectangle";
import { BasicMovementComponent } from "../../Components/Mechanics/BasicMovementComponent";
import { ForceComponent, GravityForceComponent } from "../../Components/Mechanics/ForceComponent";
import { TimerComponent } from "../../Components/Mechanics/TimerComponent";
import { DrawDirectiveStaticImage } from "../../Components/Visual/DrawDirectiveStaticImage";
import { ParticleComponent } from "../../Components/Visual/Particle";
import { HitboxType } from "../../Models/CollisionModels";
import { HorizontalAlignment, IDamagable, isDamagable, VerticalAlignment } from "../../Models/GenericInterfaces";
import { IProjectileConfig, IProjectileCollisionConfig } from "../../Models/ProjectileModels";
import { IsVec2, Vec2 } from "../../Models/Vectors";
import { Log } from "../../Workers/Logger";
import { GameEntityBase } from "../EntityBase";
import { GameplayInteractiveEntityBase } from "../GameplayInteractiveEntity";

export class ProjectileBase extends GameEntityBase {
    protected _hitbox: HitboxBase;
    protected _lifespanTimer: TimerComponent;
    protected _dd: DrawDirectiveStaticImage;
    protected _isProjectileActive: boolean = true;
    protected _particle: ParticleComponent;

    get ProjectileActive(): boolean {
        if (this.IsEnabledByHeirarchy)
            return this._isProjectileActive;
        return false;
    }

    constructor(config: IProjectileConfig, collisionConfig: IProjectileCollisionConfig) {
        super();

        let failMessage: undefined | string;
        switch (config.hitboxType) {
            case HitboxType.Circular:
                if (typeof config.hitboxSize == 'number')
                    this._hitbox = new HitboxCircle(this, config.hitboxSize);
                else
                    failMessage = `Bad hitbox size for initialized projectile base: ${config.hitboxSize}, expected radius number`;
                break;

            case HitboxType.Rectangular:
                if (IsVec2(config.hitboxSize))
                    this._hitbox = new HitboxRectangle(this, config.hitboxSize[0], config.hitboxSize[1]);
                else
                    failMessage = `Bad hitbox size for initialized projectile base: ${config.hitboxSize}, expected Vec2 for width and height`;
                break;

            case HitboxType.Polygonal:
                // First check if size not number, then if size[0][0] is number. ([0] of a number = undefined, which would be the case for Vec2)
                if (typeof config.hitboxSize != 'number' && config.hitboxSize[0][0] !== undefined)
                    this._hitbox = new HitboxPolygon(this, config.hitboxSize as Vec2[]);
                else
                    failMessage = `Bad hitbox size for initialized projectile base: ${config.hitboxSize}, expected array of Vec2`;
                break;

            default:
                failMessage = `Bad hitbox type for initialized projectile base: ${config.hitboxType} -> ${HitboxType[config.hitboxType]}`;
        }

        if (failMessage) {
            Log.Error(failMessage);
            this.Enabled = false;
            return;
        }

        if (config.particle) {
            this._particle = new ParticleComponent(this, config.particle);
            this._particle.Start();
        }

        if (config.sprite) {
            this._dd = new DrawDirectiveStaticImage(this, config.sprite, config.spriteSize);
            this._dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        }

        // Handling lifespan via component since having an entity delete itself through the 'update' method will cause trouble for any derived classes.
        if (config.lifeSpan > 0) {
            this._lifespanTimer = new TimerComponent(this, config.lifeSpan, false);
            this._lifespanTimer.OnTimesUpCallback = () => this.DeleteProjectile();
            this._lifespanTimer.Start();
        }

        this._hitbox.CollisionGroup = collisionConfig.collisionGroup;
        this._hitbox.CollideWithGroup = collisionConfig.collideWith;
        this._hitbox.TriggerState = config.triggerState;

        this._hitbox.CollisionScript = (trigerredBy: HitboxBase) => {
            if (config.damage && isDamagable(trigerredBy.Parent))
                trigerredBy.Parent.Damage(config.damage);
            this.DeleteProjectile();
        }
    }

    protected DeleteProjectile(): void {
        if (!this._isProjectileActive) return;

        this._isProjectileActive = false;
        this._hitbox.Enabled = false;
        this._lifespanTimer.Stop();

        if (this._dd) this._dd.Enabled = false;

        if (this._particle && this._particle.IsEmitting) {
            this._particle.OnEnded = () => this.Delete()
            this._particle.Stop();
        } else
            this.Delete();
    }
}

export class ProjectileBasic extends ProjectileBase {
    protected _movement: BasicMovementComponent;

    get Speed(): number { return this._movement.Speed; }
    set Speed(speed: number) { this._movement.Speed = speed; }

    constructor(config: IProjectileConfig, collisionConfig: IProjectileCollisionConfig, position: Vec2, direction: number, depth: number, speedMultiplier: number = 1) {
        super(config, collisionConfig);
        this._movement = new BasicMovementComponent(this, config.speed * speedMultiplier, 0);

        this.Transform.SetTransformParams(position, direction, null, depth);
    }

    protected DeleteProjectile(): void {
        this._movement.Enabled = false;
        super.DeleteProjectile();
    }
}

export class ProjectileBasicWeighted extends ProjectileBase {
    private _force: ForceComponent;
    private _faceDirection: boolean;

    constructor(config: IProjectileConfig, collisionConfig: IProjectileCollisionConfig, angle: number, faceDirection: boolean, forceMultiplier: number = 1) {
        super(config, collisionConfig);

        this._force = new GravityForceComponent(this, 0);
        this._force.ApplyForceInDirection(config.speed * forceMultiplier, angle);

        this._faceDirection = faceDirection;
    }

    Update(dt: number) {
        super.Update(dt);

        if (this.Enabled && this._faceDirection)
            this.Transform.Rotation = this._force.ForceDirection;
    }
}