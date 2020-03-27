import { ComponentBase } from "../Bases/ComponentBase";
import { _G } from "../Main";
import Vec2 from "../Models/Vec2";
import Vec2Utils from "../Utility/Vec2";
import ScalarUtil from "../Utility/Scalar";

export class PlayerMovementComponent extends ComponentBase {
    Update(): void {
        const movement: Vec2 = Vec2Utils.MultS(_G.InputHandler.GetNormalizedMovementVector(), ScalarUtil.FPSReletive(200, _G.Game.frameDelta));
        this.parent.transform.position = Vec2Utils.Sum(this.parent.transform.position, movement);
    }
}