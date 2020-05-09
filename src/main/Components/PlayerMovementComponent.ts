import { ComponentBase } from "../Bases/ComponentBase";
import { Vec2 } from "../Models/Vec2";
import { Vec2Utils } from "../Utility/Vec2";
import { Game } from "../Workers/Game";
import { Input } from "../Workers/InputHandler";
import { EntityBase } from "../Bases/EntityBase";
import { IKeyboardInputObserver, IMouseInputObserver } from "../Models/InputModels";
import { Camera } from "../Workers/CameraManager";

export class PlayerMovementComponent extends ComponentBase implements IKeyboardInputObserver, IMouseInputObserver {
    private _verticalDirection: number = 0;
    private _horizontalDirection: number = 0;
    private _movement: Vec2 = [0, 0];
    private _speed: number = 200;
    private _rotateTo: Vec2 | null = null;

    constructor(parent: EntityBase) {
        super(parent);
        Input.SubscribeKeyboardEvent(this);
        Input.SubscribeMouseEvent(this);
    }

    OnMouseDown(button: number, position: Vec2): void {
        // console.log('-----');
        // console.log(this.Parent.transform.Position);
        // console.log(position);

        // this._rotateTo = Vec2Utils.Sum(position, this.Parent.transform.Position);
    }
    OnMouseUp(button: number, position: Vec2): void {
        this._rotateTo = null;
    }

    Update(): void {
        this.Parent.transform.TranslateByVec2(this._movement);


        //@ts-ignore
        this.Parent.transform.RotateTowards(Game._entities[1].worldRelativeTransform.Position);

        Camera.Transform.TranslateByVec2(this._movement);
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