import { SwordDamageZoneEntity } from "../../Entities/DamageZones/SwordDamageZone";
import { IWeaponStateHandler, IWeaponStateParams, WeaponState } from "./WeaponStateBase";
import { ScalarUtil } from "../../Utility/Scalar";
import { HammerDamageZoneEntity } from "../../Entities/DamageZones/HammerDamageZone";
import { ParticleFireAndForgetEntity } from "../../Entities/Visual/Particle";

const PreSlashTime = 0.25; // Extra time before the countdown to "resting" starts
const PostSlashTime = 0.5; // Time until the next slash can occur after slashing
const MaxSlashes = 3; // Max # of slahes you can perform consecutively 
const restTimePerSlash = 0.75; // This times number of consecutive slashes = Time before you can attack after slashing

const minHammerChargeTime = 0.25; // Minimum time before the attack is release
const maxHammerChargeTime = 2; // Time the attack has to be held for maximum effect
const hammerSwingTime = 1; // Time it takes for the hammer to swing
const hammerRestTime = 1; // Time before you can attack again after a hammer swing, regardless of charge time

export class SwordIdleState extends WeaponState {
    protected _canFirePrimary = true;
    protected _canFireSecondary = true;

    PrimaryFire(params: IWeaponStateParams) {
        this._nextState = new SwordSlashState(this._handler);
    }

    SecondaryFire(params: IWeaponStateParams) {
        this._nextState = new HammerChargeState(this._handler);
    }
}

export class SwordSlashState extends WeaponState {
    protected _weaponLocked: boolean = true;
    private _time: number = PreSlashTime + PostSlashTime;
    private _didSlash: boolean = false;
    private _slash: number;

    constructor(handler: IWeaponStateHandler, slash: number = 1) {
        super(handler);
        this._canFirePrimary = true;
        this._weaponLocked = true;
        this._slash = slash;
    }

    PrimaryFire(params: IWeaponStateParams) {
        new SwordDamageZoneEntity(this._handler.Entity, params.angle);

        this._didSlash = true;
        this._canFirePrimary = false;
        this._time = PostSlashTime;
    }

    Update(delta: number) {
        this._time -= delta;
        if (this._time <= 0) {
            if (this._didSlash && this._slash < MaxSlashes)
                this._nextState = new SwordSlashState(this._handler, this._slash + 1);
            else
                this._nextState = new MeleeRestState(this._handler, this._slash * restTimePerSlash);
        }
    }
}

export class MeleeRestState extends WeaponState {
    protected _weaponLocked: boolean = true;
    private _time: number = 0;

    constructor(handler: IWeaponStateHandler, time: number) {
        super(handler);
        this._weaponLocked = true;
        this._time = time;
    }

    Update(delta: number) {
        this._time -= delta;
        if (this._time <= 0) {
            this._nextState = new SwordIdleState(this._handler);
            const p = new ParticleFireAndForgetEntity("ori_weapon_ready");
            p.Transform.Position = this._handler.Position;
            p.Burst();
        }
    }
}


export class HammerChargeState extends WeaponState {
    private _time: number = 0;
    private _released: boolean = false;
    private _maxCharge: boolean = false;
    private _particle: ParticleFireAndForgetEntity;

    protected _canFireSecondary = true;
    protected _weaponLocked = true;

    constructor(handler: IWeaponStateHandler,) {
        super(handler);
        this._particle = new ParticleFireAndForgetEntity("ori_hammer_charge");
    }

    OnInit() {
        this._particle.Burst();
        this._particle.Transform.SetTransformParams(this._handler.Position, null, null, this._handler.Depth);
    }

    SecondaryFire(params: IWeaponStateParams) {
        this._released = false;
    }
    SecondaryRelease(params: IWeaponStateParams) {
        this._released = true;
    }

    Update(delta: number) {
        this._time += delta;
        this._particle.Transform.SetTransformParams(this._handler.Position, null, null, this._handler.Depth);

        if (!this._maxCharge && this._time >= maxHammerChargeTime) {
            this._maxCharge = true;
            // Play VFX/SFX for max charge
        }

        if (this._released && this._time >= minHammerChargeTime) {
            const multiplier = 1 + ScalarUtil.Clamp(minHammerChargeTime, this._time, maxHammerChargeTime) / maxHammerChargeTime;
            this._nextState = new HammerSwingState(this._handler, multiplier);
            this._particle.Delete();
        }
    }
}

export class HammerSwingState extends WeaponState {
    protected _weaponLocked: boolean = true;
    private _time: number = 0;
    private _powerMultiplier: number;

    constructor(handler: IWeaponStateHandler, powerMultiplier: number) {
        super(handler);
        this._powerMultiplier;
        this._weaponLocked = true;
        this._powerMultiplier = powerMultiplier;
    }

    OnInit(params: IWeaponStateParams) {
        new HammerDamageZoneEntity(this._handler.Entity, params.angle, this._powerMultiplier);
    }

    Update(delta: number) {
        this._time += delta;
        if (this._time >= hammerSwingTime)
            this._nextState = new MeleeRestState(this._handler, hammerRestTime);
    }
}

export const InitialMeleeState = SwordIdleState;