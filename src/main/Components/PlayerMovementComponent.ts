import { ComponentBase } from "./ComponentBase";
import { Vec2 } from "../Models/Vectors";
import { Vec2Utils } from "../Utility/Vec2";
import { Input } from "../Workers/InputHandler";
import { EntityBase } from "../Entities/EntityBase";
import { IKeyboardObserver, IKeyboardEvent, ButtonState } from "../Models/InputModels";

export class PlayerMovementComponent extends ComponentBase implements IKeyboardObserver {
    private _verticalDirection: number = 0;
    private _horizontalDirection: number = 0;
    private _movement: Vec2 = [0, 0];
    private _speed: number = 200;

    constructor(parent: EntityBase) {
        super(parent);
        Input.KeyboardObservable.Subscribe(this);
    }

    Update(delta: number): void {
        this.Parent.transform.TranslateByVec2(Vec2Utils.MultS(this._movement, this._speed * delta));
    }

    OnObservableNotified(args: IKeyboardEvent): void {
        if (args.state == ButtonState.Down)
            this.OnKeyDown(args.keyName)
        else
            this.OnKeyUp(args.keyName)
    }

    private OnKeyDown(key: string): void {
        switch (key) {
            case 'up': this._verticalDirection++; break;
            case 'down': this._verticalDirection--; break;
            case 'right': this._horizontalDirection++; break;
            case 'left': this._horizontalDirection--; break;
            default: return;
        }
        this.RecalculateMovement();
    }

    private OnKeyUp(key: string): void {
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
        this._movement = Vec2Utils.Normalize([this._horizontalDirection, this._verticalDirection]);
    }

    Unitialize(): void {
        super.Unitialize();
        Input.KeyboardObservable.Unsubscribe(this);
    }
}