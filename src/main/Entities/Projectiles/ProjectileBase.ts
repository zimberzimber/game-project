import { HitboxBase } from "../../Components/Hitboxes/HitboxBase";
import { HitboxCircle } from "../../Components/Hitboxes/HitboxCircle";
import { HitboxPolygon } from "../../Components/Hitboxes/HitboxPolygon";
import { HitboxRectangle } from "../../Components/Hitboxes/HitboxRectangle";
import { BasicMovementComponent } from "../../Components/Mechanics/BasicMovementComponent";
import { TimerComponent } from "../../Components/Mechanics/TimerComponent";
import { DrawDirectiveStaticImage } from "../../Components/Visual/DrawDirectiveStaticImage";
import { ParticleComponent } from "../../Components/Visual/Particle";
import { CollisionGroup, HitboxType, TriggerState } from "../../Models/CollisionModels";
import { HorizontalAlignment, VerticalAlignment } from "../../Models/GenericInterfaces";
import { IsVec2, Vec2 } from "../../Models/Vectors";
import { Log } from "../../Workers/Logger";
import { GameEntityBase } from "../EntityBase";
import { GameplayInteractiveEntityBase } from "../GameplayInteractiveEntity";

interface IProjectileConfig {
    speed: number;
    directionAngle: number;
    lifeSpan: number;
    hitboxType: HitboxType;
    hitboxSize: number | Vec2 | Vec2[];
    collisionGroup: CollisionGroup;
    collideWith: CollisionGroup;
    triggerState: TriggerState;

    sprite?: string;
    spriteSize?: number | Vec2;
    // animationSpeed: number;
    particle?: string;
    damage?: number;
}

export class ProjectileBasic extends GameEntityBase {
    protected _movement: BasicMovementComponent;
    protected _hitbox: HitboxBase;
    protected _lifespanTimer: TimerComponent;
    protected _dd: DrawDirectiveStaticImage;
    protected _isProjectileActive: boolean = true;
    protected _particle: ParticleComponent;

    get Speed(): number { return this._movement.Speed; }
    set Speed(speed: number) { this._movement.Speed = speed; }

    constructor(config: IProjectileConfig) {
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
                    this._hitbox = new HitboxPolygon(this, ...(config.hitboxSize as Vec2[]));
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

        this._movement = new BasicMovementComponent(this, config.speed, config.directionAngle);

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
            this._lifespanTimer.OnTimesUpCallback = () => this.DisableProjectile();
            this._lifespanTimer.Start();
        }
        this._hitbox.CollisionGroup = config.collisionGroup;
        this._hitbox.CollideWithGroup = config.collideWith;
        this._hitbox.TriggerState = config.triggerState;

        this._hitbox.CollisionScript = (trigerredBy: HitboxBase) => {
            if (config.damage && trigerredBy.Parent instanceof GameplayInteractiveEntityBase)
                trigerredBy.Parent.Damage(config.damage);
            this.DisableProjectile();
        }
    }

    protected DisableProjectile(): void {
        if (!this._isProjectileActive) return;

        this._isProjectileActive = false;
        this._movement.Enabled = false;
        this._hitbox.Enabled = false;
        this._lifespanTimer.Stop();

        if (this._dd) this._dd.Enabled = false;

        if (this._particle && this._particle.IsEmitting) {
            this._particle.OnEnded = () => this.Delete();
            this._particle.Stop();
        } else
            this.Delete();
    }

}

export class old extends GameEntityBase {
    protected _movement: BasicMovementComponent;
    protected _hitbox: HitboxBase;
    protected _lifespanTimer: TimerComponent;

    get Speed(): number { return this._movement.Speed; }
    set Speed(speed: number) { this._movement.Speed = speed; }

    constructor(speed: number, direction: number, timeToLive: number, hitboxType: HitboxType, hitboxSize: number | Vec2 | Vec2[], collisionGroup: CollisionGroup, collidesWith: CollisionGroup, triggerState: TriggerState) {
        super();

        let failMessage: undefined | string;
        switch (hitboxType) {
            case HitboxType.Circular:
                if (typeof hitboxSize == 'number')
                    this._hitbox = new HitboxCircle(this, hitboxSize);
                else
                    failMessage = `Bad hitbox size for initialized projectile base: ${hitboxSize}, expected radius number`;
                break;

            case HitboxType.Rectangular:
                if (IsVec2(hitboxSize))
                    this._hitbox = new HitboxRectangle(this, hitboxSize[0], hitboxSize[1]);
                else
                    failMessage = `Bad hitbox size for initialized projectile base: ${hitboxSize}, expected Vec2 for width and height`;
                break;

            case HitboxType.Polygonal:
                // First check if size not number, then if size[0][0] is number. ([0] of a number = undefined, which would be the case for Vec2)
                if (typeof hitboxSize != 'number' && hitboxSize[0][0] !== undefined)
                    this._hitbox = new HitboxPolygon(this, ...(hitboxSize as Vec2[]));
                else
                    failMessage = `Bad hitbox size for initialized projectile base: ${hitboxSize}, expected array of Vec2`;
                break;

            default:
                failMessage = `Bad hitbox type for initialized projectile base: ${hitboxType} -> ${HitboxType[hitboxType]}`;
        }

        if (failMessage) {
            Log.Error(failMessage);
            this.Enabled = false;
            return;
        }

        this._movement = new BasicMovementComponent(this, speed, direction);

        // Handling lifespan via component since having an entity delete itself through the 'update' method will cause trouble for any derived classes.
        if (timeToLive > 0) {
            this._lifespanTimer = new TimerComponent(this, timeToLive, false);
            this._lifespanTimer.OnTimesUpCallback = () => this.Delete();
            this._lifespanTimer.Start();
        }
        this._hitbox.CollisionGroup = collisionGroup;
        this._hitbox.CollideWithGroup = collidesWith;
        this._hitbox.TriggerState = triggerState;
    }
}