import { Vec2 } from "../Vectors";
import { SwordDamageZoneEntity } from "../../Entities/DamageZones/SwordDamageZoneEntity";
import { WeaponState } from "./WeaponStateBase";

const PreSlashTime = 0.25; // Extra time before the countdown to "resting" starts
const PostSlashTime = 0.5; // Time until the next slash can occur after slashing
const MaxSlashes = 3;

const restTimeExtra = 1.5; // Multiplied by # of performed slashes for rest time

class SwordIdleState extends WeaponState {
    _nextState: SwordSlashState;
    
    OnFire() {
        this._nextState = new SwordSlashState();
    }
}

class SwordSlashState extends WeaponState {
    private _time: number = PreSlashTime + PostSlashTime;
    private _didSlash: boolean = false;
    private _slash: number;
    _weaponLocked: boolean;
    _nextState: WeaponState;

    // Can fire if a slash hasn't happened yet
    get CanFire(): boolean {
        return !this._didSlash;
    }

    constructor(slash: number = 1) {
        super();
        this._weaponLocked = true;
        this._slash = slash;
    }

    OnFire(origin: Vec2, angle: number) {
        // Spawn slash

        const p = new SwordDamageZoneEntity(angle);
        p.Transform.Position = origin;

        this._didSlash = true;
        this._time = PostSlashTime;
    }

    Update(delta: number) {
        this._time -= delta;
        if (this._time <= 0) {
            if (this._didSlash && this._slash < MaxSlashes)
                this._nextState = new SwordSlashState(this._slash + 1);
            else
                this._nextState = new SwordRestState(this._slash);
        }
    }
}

class SwordRestState extends WeaponState {
    private _duration: number = 0;
    _weaponLocked: boolean;
    _nextState: SwordIdleState;

    constructor(multiplier: number) {
        super();
        this._weaponLocked = true;
        this._duration = multiplier * restTimeExtra;
    }

    Update(delta: number) {
        this._duration -= delta;
        if (this._duration <= 0) {
            this._nextState = new SwordIdleState();
        }
    }
}

export const InitialSwordState = SwordIdleState;