import { ComponentBase } from "../Bases/ComponentBase";
import { Vec2 } from "../Models/Vec2";
import { Vec2Utils } from "../Utility/Vec2";
import { Game } from "../Workers/Game";
import { Input } from "../Workers/InputHandler";
import { EntityBase } from "../Bases/EntityBase";
import { IKeyboardInputObserver } from "../Models/InputModels";

export class PlayerMovementComponent extends ComponentBase implements IKeyboardInputObserver {
    private _verticalDirection: number = 0;
    private _horizontalDirection: number = 0;
    private _movement: Vec2 = [0, 0];
    private _speed: number = 200;

    constructor(parent: EntityBase) {
        super(parent);
        Input.SubscribeKeyboardEvent(this);
    }

    Update(): void {
        this._parent.transform.Position = Vec2Utils.Sum(this._parent.transform.Position, this._movement);
    }

    OnKeyDown(key: string): void {
        switch (key) {
            case 'up': this._verticalDirection++; break;
            case 'down': this._verticalDirection--; break;
            case 'right': this._horizontalDirection++; break;
            case 'left': this._horizontalDirection--; break;
            default: return;
        }
        this.RecalculateMovement();
    }

    OnKeyUp(key: string): void {
        switch (key) {
            case 'up': this._verticalDirection--; break;
            case 'down': this._verticalDirection++; break;
            case 'right': this._horizontalDirection--; break;
            case 'left': this._horizontalDirection++; break;
            default: return;
        }
        this.RecalculateMovement();
    }

    private RecalculateMovement(): void {
        this._movement = Vec2Utils.MultS(Vec2Utils.Normalize([this._horizontalDirection, this._verticalDirection]), Game.FPSReletive(this._speed));
    }

    Unitialize(): void {
        super.Unitialize();
        Input.UnsubscribeKeyboardEvent(this);
    }
}