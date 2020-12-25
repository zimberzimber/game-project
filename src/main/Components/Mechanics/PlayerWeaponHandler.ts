import { GameEntityBase } from "../../Entities/EntityBase";
import { PlayerEntity } from "../../Entities/Player/PlayerRoot";
import { ControlKey } from "../../Models/ControlKeys";
import { IMouseObserver, IMouseEvent, MouseButton, ButtonState, IKeyboardObserver, IKeyboardEvent } from "../../Models/InputModels";
import { InitialMeleeState } from "../../Models/PlayerWeaponStates/Melee";
import { InitialRangedState } from "../../Models/PlayerWeaponStates/Ranged";
import { InitialSpecialState } from "../../Models/PlayerWeaponStates/Special";
import { IWeaponStateHandler, IWeaponStateParams, WeaponState } from "../../Models/PlayerWeaponStates/WeaponStateBase";
import { Vec2 } from "../../Models/Vectors";
import { Vec2Utils } from "../../Utility/Vec2";
import { Input } from "../../Workers/InputHandler";
import { ComponentBase } from "../ComponentBase";

const initialStates = [InitialMeleeState, InitialRangedState, InitialSpecialState];

export class PlayerWeaponHandlerComponent extends ComponentBase implements IWeaponStateHandler {
    private _isBlocked: boolean = false;
    private _initialStateIndex = 0;
    private _state: WeaponState = new initialStates[0](this);
    private _offset?: Vec2;

    protected _parent: PlayerEntity;

    get Position(): Vec2 { return this._parent.WorldRelativeTransform.Position; }
    get Depth(): number { return this._parent.WorldRelativeTransform.Depth; }
    get Entity(): GameEntityBase { return this._parent as GameEntityBase; }
    get CurrentState(): string { return this._state.constructor.name; }

    GetEnergy(): number {
        return this._parent.Energy[0];
    }
    UseEnergy(energy: number) {
        this._parent.UseEnergy(energy);
    }

    private _primaryFiring: boolean = false;
    private get PrimaryFiring(): boolean { return this._primaryFiring; }
    private set PrimaryFiring(newState: boolean) {
        if (newState == this._primaryFiring) return;

        this._primaryFiring = newState;
        newState == true ? this.FirePrimary() : this.ReleasePrimary();
    }

    private _secondaryFiring: boolean = false;
    private get SecondaryFiring(): boolean { return this._secondaryFiring; }
    private set SecondaryFiring(newState: boolean) {
        if (newState == this._secondaryFiring) return;

        this._secondaryFiring = newState;
        newState == true ? this.FireSecondary() : this.ReleaseSecondary();
    }


    private _mouseObserver: IMouseObserver = {
        OnObservableNotified: (args: IMouseEvent) => {
            if (args.button == MouseButton.M1)
                this.PrimaryFiring = args.state == ButtonState.Down;
            else if (args.button == MouseButton.M2)
                this.SecondaryFiring = args.state == ButtonState.Down;
        }
    }

    private _keyboardObserver: IKeyboardObserver = {
        OnObservableNotified: (args: IKeyboardEvent) => {
            if (this._isBlocked || args.state == ButtonState.Up) return;

            if (args.key == ControlKey.nextWeapon) {
                this._initialStateIndex = (this._initialStateIndex + 1) % initialStates.length;
                this._state = new initialStates[this._initialStateIndex](this);

            } else if (args.key == ControlKey.prevWeapon) {
                this._initialStateIndex = (this._initialStateIndex == 0 ? initialStates.length : this._initialStateIndex) - 1;
                this._state = new initialStates[this._initialStateIndex](this);
            }
        }
    }

    constructor(parent: PlayerEntity, offset?: Vec2) {
        super(parent);
        Input.MouseObservable.Subscribe(this._mouseObserver);
        Input.KeyboardObservable.Subscribe(this._keyboardObserver);
        this._offset = offset;
    }

    private FirePrimary() {
        if (!this._isBlocked && this._state.CanFirePrimary)
            this._state.PrimaryFire(this.GetAim());
    }

    private ReleasePrimary() {
        this._state.PrimaryRelease(this.GetAim());
    }

    private FireSecondary() {
        if (!this._isBlocked && this._state.CanFireSecondary)
            this._state.SecondaryFire(this.GetAim());
    }

    private ReleaseSecondary() {
        this._state.SecondaryRelease(this.GetAim());
    }

    private GetAim(): IWeaponStateParams {
        let origin: Vec2 = this.Parent.WorldRelativeTransform.Position;

        if (this._offset)
            origin = Vec2Utils.Sum(this.Parent.WorldRelativeTransform.Position, this._offset);

        const angle = Vec2Utils.GetAngle(origin, Input.MousePosition);

        return { origin, angle }
    }

    Update(delta: number) {
        super.Update(delta);
        this._state.Update(delta);

        if (this._state.NextState) {
            this._state = this._state.NextState;
            this._state.OnInit(this.GetAim());
        }

        if (this.PrimaryFiring) this.FirePrimary();
        if (this.SecondaryFiring) this.FireSecondary();
    }

    Uninitialize(): void {
        Input.MouseObservable.Unsubscribe(this._mouseObserver);
        Input.KeyboardObservable.Unsubscribe(this._keyboardObserver);
        super.Uninitialize();
    }
}