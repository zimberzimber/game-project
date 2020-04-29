import { EntityBase } from "../Bases/EntityBase";
import { PlayerMovementComponent } from "../Components/PlayerMovementComponent";
import { ImageDrawDirective } from "../Components/DrawDirectives/ImageDrawDirective";
import { TriggerState } from "../Models/TriggerState";
import { HitboxPolygon } from "../Components/Hitboxes/HitboxPolygon";
import { Vec2Utils } from "../Utility/Vec2";
import { ScalarUtil } from "../Utility/Scalar";
import { HitboxCircle } from "../Components/Hitboxes/HitboxCircle";
import { HitboxRectangle } from "../Components/Hitboxes/HitboxRectangle";

export class PlayerEntity extends EntityBase {
    constructor(parent: EntityBase | void) {
        super(parent);
        this.AddComponent(new PlayerMovementComponent(this));
        this.AddComponent(new ImageDrawDirective(this, "heart", [10, 10]));

        // const hitbox = new HitboxRectangle(this, 40, 10);
        // const hitbox = new HitboxCircle(this, 10);
        // const hitbox = new HitboxPolygon(this, [0, 30], [-10, 0], [0, -10], [10, 0]);
        const hitbox = new HitboxPolygon(this, [1, -12], [7, -9], [10, -4], [10, 3], [8, 9], [3, 12], [-4, 12], [-10, 9], [-3, 8], [3, 5], [4, -1], [2, -6], [-3, -7], [-10, -7]);

        hitbox.SetTriggerState(TriggerState.NotTrigger);
        this.AddComponent(hitbox);
    }

    Update() {
        super.Update();
        // this.transform.Rotate(0.5);
        // this.transform.position = Vec2Utils.Transform(this.transform.position, ScalarUtil.Shake() * 0.5, ScalarUtil.Shake() * 0.5);
    }
}