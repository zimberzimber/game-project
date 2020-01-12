import { ComponentBase } from "../Bases/ComponentBase";
import { _G } from "../Main";
import { Util } from "../Utility";
import { Vec2 } from "../Models/Vec2";

export class PlayerMovementComponent extends ComponentBase {
    Update(): void {
        const movement = Vec2.Multiply(_G.InputHandler.GetNormalizedMovementVector(), Util.FPSReletive(200))
        this.parent.transform.position.TransformByVec(movement);
    }
}