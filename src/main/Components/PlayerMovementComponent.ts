import { ComponentBase } from "../Bases/ComponentBase";
import { Vec2 } from "../Models/Vectors";
import { Vec2Utils } from "../Utility/Vec2";
import { Game } from "../Workers/Game";
import { Input } from "../Workers/InputHandler";
import { EntityBase } from "../Bases/EntityBase";
import { Camera } from "../Workers/CameraManager";
import { IMouseObserver, IKeyboardObserver, IKeyboardEvent, IMouseEvent, ButtonState } from "../Models/InputModels";
import { Test2Entity } from "../Entities/Test2";

export class PlayerMovementComponent extends ComponentBase implements IMouseObserver, IKeyboardObserver {
    private _verticalDirection: number = 0;
    private _horizontalDirection: number = 0;
    private _movement: Vec2 = [0, 0];
    private _speed: number = 200;

    constructor(parent: EntityBase) {
        super(parent);
        Input.KeyboardObservable.Subscribe(this);
        Input.MouseObservable.Subscribe(this);
    }

    Update(): void {
        this.Parent.transform.TranslateByVec2(this._movement);
        Camera.Transform.TranslateByVec2(this._movement);
        // Camera.Transform.RotateTowards(Input.MousePosition);

        Camera.Transform.Rotate(1);
        this.Parent.transform.Rotation = -Camera.Transform.Rotation;
    }

    OnObservableNotified(args: IKeyboardEvent | IMouseEvent): void {
        // Check if its a keyboard or mouse event
        if ((args as IKeyboardEvent).keyName) {
            const e = args as IKeyboardEvent;
            if (args.state == ButtonState.Down)
                this.OnKeyDown(e.keyName)
            else
                this.OnKeyUp(e.keyName)
        } else {
            const e = args as IMouseEvent;
            if (args.state == ButtonState.Down)
                this.OnMouseDown(e.button, e.position)
            else
                this.OnMouseUp(e.button, e.position)
        }
    }

    private OnMouseDown(button: number, position: Vec2): void {
        const zz = new Test2Entity();
        Game.AddEntity(zz);
        zz.transform.Position = Game.MousePosition;
    }

    private OnMouseUp(button: number, position: Vec2): void {

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
        this._movement = Vec2Utils.MultS(Vec2Utils.Normalize([this._horizontalDirection, this._verticalDirection]), Game.FPSReletive(this._speed));
    }

    Unitialize(): void {
        super.Unitialize();
        Input.KeyboardObservable.Unsubscribe(this);
        Input.MouseObservable.Unsubscribe(this);
    }
}