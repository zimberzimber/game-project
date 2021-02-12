import { ProjectileCollisionDictionary, ProjectileDictionary } from "../../AssetDefinitions/BasicProjectileDefinitions";
import { ProjectileBasic, ProjectileBasicWeighted } from "../../Entities/Projectiles/ProjectileBase";
import { ParticleFireAndForgetEntity } from "../../Entities/Visual/Particle";
import { ScalarUtil } from "../../Utility/Scalar";
import { WeaponState, IWeaponStateParams, IWeaponStateHandler } from "./WeaponStateBase";

export class RangedIdleState extends WeaponState {
    protected _canFirePrimary = true;
    protected _canFireSecondary = true;

    PrimaryFire(params: IWeaponStateParams) {
        this._nextState = new BowChargeState(this._handler);
    }

    SecondaryFire(params: IWeaponStateParams) {
        this._nextState = new SpikeChargeState(this._handler);
    }
}

const minTime = 0.75;
const maxBowTime = 3;

export class BowChargeState extends WeaponState {
    private _time: number = 0;
    private _readyFire: boolean = false;
    private _maxCharge: boolean = false;

    protected _canFireSecondary = true;
    protected _weaponLocked = true;

    PrimaryRelease(params: IWeaponStateParams) {
        if (this._readyFire) {
            const multiplier = ScalarUtil.Clamp(minTime, this._time, maxBowTime) / maxBowTime;

            const a = ScalarUtil.IsAngleFacingRight(params.angle) ? 0 : 180;
            const t = this._handler.Entity.WorldRelativeTransform;
            new ProjectileBasic(ProjectileDictionary.ori_arrow, ProjectileCollisionDictionary.player_projectile, t.Position, a, t.Depth, multiplier);
        }
        this._nextState = new RangedIdleState(this._handler);
    }

    Update(delta: number) {
        if (!this._maxCharge) {
            this._time += delta;

            if (this._time >= minTime) {
                this._weaponLocked = true;
                this._readyFire = true;
                // Play FX
            }

            if (this._time >= maxBowTime) {
                this._maxCharge = true;
                console.log("max");
                // Play FX
            }
        }
    }
}

export class SpikeChargeState extends WeaponState {
    private _time: number = 0;
    private _readyFire: boolean = false;

    protected _canFireSecondary = true;
    protected _weaponLocked: boolean = true;
    private _particle: ParticleFireAndForgetEntity;

    constructor(handler: IWeaponStateHandler,) {
        super(handler);
        this._particle = new ParticleFireAndForgetEntity("ori_hammer_charge");
    }

    OnInit() {
        this._particle.Burst();
        this._particle.Transform.SetTransformParams(this._handler.Position, null, null, this._handler.Depth);
    }

    SecondaryRelease(params: IWeaponStateParams) {
        if (this._readyFire) {
            const a = ScalarUtil.IsAngleFacingRight(params.angle) ? 0 : 180;
            const t = this._handler.Entity.WorldRelativeTransform;
            new ProjectileBasic(ProjectileDictionary.ori_spike, ProjectileCollisionDictionary.player_projectile, t.Position, a, t.Depth);
        }
        this._nextState = new RangedIdleState(this._handler);
        this._particle.Delete();
    }

    Update(delta: number) {
        // Had to split this because 'SecondaryRelease' may happen just before an update occurs
        // And the second check is to make sure it wasn't deleted yet
        if (!this._readyFire) {
            this._time += delta;
            if (this._time >= minTime) {
                this._weaponLocked = true;
                this._readyFire = true;
            }
        }

        if (this._particle.Enabled)
            this._particle.Transform.SetTransformParams(this._handler.Position, null, null, this._handler.Depth);
    }
}

export const InitialRangedState = RangedIdleState;