import { ComponentBase } from "../ComponentBase";
import { Vec2 } from "../../Models/Vectors";
import { Vec2Utils } from "../../Utility/Vec2";
import { Input } from "../../Workers/InputHandler";
import { EntityBase } from "../../Entities/EntityBase";
import { IKeyboardObserver, IKeyboardEvent, ButtonState } from "../../Models/InputModels";
import { ControlKey } from "../../Models/ControlKeys";

export class PlayerMovementComponent extends ComponentBase implements IKeyboardObserver {
    private _verticalDirection: number = 0;
    private _horizontalDirection: number = 0;
    private _movement: Vec2 = [0, 0];
    private _speed: number = 200;

    constructor(parent: EntityBase) {
        super(parent);
        Input.KeyboardObservable.Subscribe(this);

        if (Input.IsKeyDown(ControlKey.up)) this.OnKeyDown(ControlKey.up);
        if (Input.IsKeyDown(ControlKey.down)) this.OnKeyDown(ControlKey.down);
        if (Input.IsKeyDown(ControlKey.left)) this.OnKeyDown(ControlKey.left);
        if (Input.IsKeyDown(ControlKey.right)) this.OnKeyDown(ControlKey.right);
    }

    Update(delta: number): void {
        this.Parent.transform.TranslateByVec2(Vec2Utils.MultS(this._movement, this._speed * delta));
    }

    OnObservableNotified(args: IKeyboardEvent): void {
        if (args.state == ButtonState.Down)
            this.OnKeyDown(args.key)
        else
            this.OnKeyUp(args.key)
    }

    private OnKeyDown(key: ControlKey): void {
        switch (key) {
            case ControlKey.up: this._verticalDirection++; break;
            case ControlKey.down: this._verticalDirection--; break;
            case ControlKey.right: this._horizontalDirection++; break;
            case ControlKey.left: this._horizontalDirection--; break;
            default: return;
        }
        this.RecalculateMovement();
    }

    private OnKeyUp(key: ControlKey): void {
        switch (key) {
            case ControlKey.up: this._verticalDirection--; break;
            case ControlKey.down: this._verticalDirection++; break;
            case ControlKey.right: this._horizontalDirection--; break;
            case ControlKey.left: this._horizontalDirection++; break;
            default: return;
        }
        this.RecalculateMovement();
    }

    private RecalculateMovement(): void {
        this._movement = Vec2Utils.Normalize([this._horizontalDirection, this._verticalDirection]);
    }

    Unitialize(): void {
        super.Unitialize();
        Input.KeyboardObservable.Unsubscribe(this);
    }
}