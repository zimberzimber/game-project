import { ComponentBase } from "../Bases/ComponentBase";
import Vec2 from "../Models/Vec2";
import Vec2Utils from "../Utility/Vec2";
import ScalarUtil from "../Utility/Scalar";
import Game from "../Workers/Game";
import InputHandler from "../Workers/InputHandler";

export class PlayerMovementComponent extends ComponentBase {
    Update(): void {
        const movement: Vec2 = Vec2Utils.MultS(InputHandler.GetNormalizedMovementVector(), ScalarUtil.FPSReletive(200, Game.frameDelta));
        this.parent.transform.position = Vec2Utils.Sum(this.parent.transform.position, movement);
    }
}