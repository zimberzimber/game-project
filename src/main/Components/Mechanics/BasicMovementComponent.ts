import { ComponentBase } from "../ComponentBase";
import { EntityBase } from "../../Entities/EntityBase";
import { Vec2Utils } from "../../Utility/Vec2";

export class BasicMovementComponent extends ComponentBase {
    Speed: number;

    private _dir: number;
    get DirectionAngle(): number { return this._dir; }
    set DirectionAngle(angle: number) {
        this._dir = angle % 360;
    }

    constructor(parent: EntityBase, speed: number, directionAngle: number) {
        super(parent);

        this.Speed = speed;
        this.DirectionAngle = directionAngle;
    }

    Update(delta: number): void {
        const trans = this.Parent.Transform;
        trans.Position = Vec2Utils.MoveTowardsAngle(trans.Position, this._dir + trans.Rotation, this.Speed * delta);
    }
}