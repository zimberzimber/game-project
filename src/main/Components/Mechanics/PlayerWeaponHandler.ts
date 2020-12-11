import { EntityBase, GameEntityBase } from "../../Entities/EntityBase";
import { IMouseObserver, IMouseEvent, MouseButton, ButtonState } from "../../Models/InputModels";
import { InitialMeleeState } from "../../Models/PlayerWeaponStates/Melee";
import { IWeaponStateHandler, IWeaponStateParams, WeaponState } from "../../Models/PlayerWeaponStates/WeaponStateBase";
import { Vec2 } from "../../Models/Vectors";
import { Vec2Utils } from "../../Utility/Vec2";
import { Input } from "../../Workers/InputHandler";
import { ComponentBase } from "../ComponentBase";

export class PlayerWeaponHandlerComponent extends ComponentBase implements IWeaponStateHandler {
    private _isBlocked: boolean = false;
    private _state: WeaponState = new InitialMeleeState(this);
    private _offset?: Vec2;

    get Position(): Vec2 { return this._parent.WorldRelativeTransform.Position; }
    get Depth(): number { return this._parent.WorldRelativeTransform.Depth; }
    get Entity(): GameEntityBase { return this._parent as GameEntityBase; }

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

    constructor(parent: GameEntityBase, offset?: Vec2) {
        super(parent);
        Input.MouseObservable.Subscribe(this._mouseObserver);
        this._offset = offset;
    }

    private _mouseObserver: IMouseObserver = {
        OnObservableNotified: (args: IMouseEvent) => {
            if (args.button == MouseButton.M1)
                this.PrimaryFiring = args.state == ButtonState.Down;
            else if (args.button == MouseButton.M2)
                this.SecondaryFiring = args.state == ButtonState.Down;
        }
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
        super.Uninitialize();
    }
}