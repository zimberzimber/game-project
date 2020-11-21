import { Vec2 } from "../Vectors";

export abstract class WeaponState {
    protected _weaponLocked: boolean = false;
    get IsWeaponLocked(): boolean { return this._weaponLocked; }

    protected _nextState: undefined | WeaponState;
    get NextState(): undefined | WeaponState { return this._nextState; }

    get CanFire(): boolean { return true; }

    OnStart(param: any) { }
    OnFire(origin: Vec2, angle: number) { }
    OnRelease(origin: Vec2, angle: number) { }
    Update(delta: number) { }
}