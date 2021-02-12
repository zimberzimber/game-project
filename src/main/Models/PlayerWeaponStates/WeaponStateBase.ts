import { EnergyResourceComponent } from "../../Components/Mechanics/Resource";
import { EntityBase, GameEntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../Vectors";

export interface IWeaponStateParams {
    origin: Vec2;
    angle: number;
}

export interface IWeaponStateHandler {
    Position: Vec2;
    Depth: number;
    Entity: GameEntityBase;
    GetEnergy(): number;
    TryConsumeEnergy(energy: number): boolean;
}

export abstract class WeaponState {
    protected _weaponLocked: boolean = false;
    get IsWeaponLocked(): boolean { return this._weaponLocked; }

    protected _canFirePrimary: boolean = false;
    get CanFirePrimary(): boolean { return this._canFirePrimary; }

    protected _canFireSecondary: boolean = false
    get CanFireSecondary(): boolean { return this._canFireSecondary; }

    protected _nextState: undefined | WeaponState;
    get NextState(): undefined | WeaponState { return this._nextState; }

    protected _handler: IWeaponStateHandler;

    constructor(handler: IWeaponStateHandler) {
        this._handler = handler;
    }

    OnInit(params: IWeaponStateParams) { }

    PrimaryFire(params: IWeaponStateParams) { }
    PrimaryRelease(params: IWeaponStateParams) { }

    SecondaryFire(params: IWeaponStateParams) { }
    SecondaryRelease(params: IWeaponStateParams) { }

    Update(delta: number) { }
}