import { GameEntityBase } from "../../Entities/EntityBase";
import { IMouseObserver, IMouseEvent, MouseButton, ButtonState } from "../../Models/InputModels";
import { InitialSwordState } from "../../Models/PlayerWeaponStates/Melee";
import { WeaponState } from "../../Models/PlayerWeaponStates/WeaponStateBase";
import { Vec2 } from "../../Models/Vectors";
import { Vec2Utils } from "../../Utility/Vec2";
import { Input } from "../../Workers/InputHandler";
import { ComponentBase } from "../ComponentBase";

export class PlayerWeaponHandlerComponent extends ComponentBase {
    private _primaryFiring: boolean = false;
    private _isSecondaryFiring: boolean = false;
    private _isBlocked: boolean = false;
    private _state: WeaponState = new InitialSwordState();
    private _offset?: Vec2;

    private _mouseObserver: IMouseObserver = {
        OnObservableNotified: (args: IMouseEvent) => {
            if (!this._isBlocked) {
                if (args.button == MouseButton.M1) {

                    if (this._primaryFiring && args.state == ButtonState.Up)
                        this.Release();
                    else if (!this._primaryFiring && args.state == ButtonState.Down)
                        this.Fire();

                    this._primaryFiring = args.state == ButtonState.Down;
                }
                else if (args.button == MouseButton.M2)
                    this._isSecondaryFiring = args.state == ButtonState.Down;
            }
        }
    }

    constructor(parent: GameEntityBase, offset?: Vec2) {
        super(parent);
        Input.MouseObservable.Subscribe(this._mouseObserver);
        this._offset = offset;
    }

    Update(delta: number) {
        super.Update(delta);
        this._state.Update(delta);

        if (this._state.NextState) {
            this._state = this._state.NextState;
            if (this._primaryFiring)
                this.Fire();
        }
    }

    GetAim() {
    }

    Fire() {
        if (!this._state.CanFire) return;

        var origin: Vec2;

        if (this._offset)
            origin = Vec2Utils.Sum(this.Parent.WorldRelativeTransform.Position, this._offset);
        else
            origin = this.Parent.WorldRelativeTransform.Position;

        var angle = Vec2Utils.GetAngle(origin, Input.MousePosition);
        this._state.OnFire(origin, angle);
    }

    Release() {
        var origin = this.Parent.WorldRelativeTransform.Position;
        var angle = Vec2Utils.GetAngle(origin, Input.MousePosition);
        this._state.OnRelease(origin, angle);
    }

    Uninitialize(): void {
        Input.MouseObservable.Unsubscribe(this._mouseObserver);
        super.Uninitialize();
    }
}