import { ComponentBase } from "../Bases/ComponentBase";
import { Vec2 } from "../Models/Vec2";
import { Vec2Utils } from "../Utility/Vec2";
import { ScalarUtil } from "../Utility/Scalar";
import { Game } from "../Workers/Game";
import { Input } from "../Workers/InputHandler";
import { EntityBase } from "../Bases/EntityBase";
import { IInputObserver } from "../Models/InputModels";

export class PlayerMovementComponent extends ComponentBase implements IInputObserver {
    private verticalDirection: number = 0;
    private horizontalDirection: number = 0;
    private movement: Vec2 = [0, 0];
    private speed: number = 200;

    constructor(parent: EntityBase) {
        super(parent);
        Input.Subscribe(this);
    }

    Update(): void {
        this.parent.transform.position = Vec2Utils.Sum(this.parent.transform.position, this.movement);
    }

    OnKeyDown(key: string): void {
        switch (key) {
            case 'up': this.verticalDirection++; break;
            case 'down': this.verticalDirection--; break;
            case 'right': this.horizontalDirection++; break;
            case 'left': this.horizontalDirection--; break;
            default: return;
        }
        this.RecalculateMovement();
    }

    OnKeyUp(key: string): void {
        switch (key) {
            case 'up': this.verticalDirection--; break;
            case 'down': this.verticalDirection++; break;
            case 'right': this.horizontalDirection--; break;
            case 'left': this.horizontalDirection++; break;
            default: return;
        }
        this.RecalculateMovement();
    }

    private RecalculateMovement(): void {
        this.movement = Vec2Utils.MultS(Vec2Utils.Normalize([this.horizontalDirection, this.verticalDirection]), ScalarUtil.FPSReletive(this.speed, Game.frameDelta));
    }

    Unitialize(): void {
        super.Unitialize();
        Input.Unsubscribe(this);
    }
}