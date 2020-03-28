import { _G } from "../Main";
import { EntityBase } from "../Bases/EntityBase";
import { PlayerMovementComponent } from "../Components/PlayerMovementComponent";
import { ImageDrawDirective } from "../DrawDirectives/ImageDrawDirective";
import { TriggerState } from "../Models/TriggerState";
import { HitboxPolygon } from "../Components/HitboxPolygon";

export class PlayerEntity extends EntityBase {
    constructor() {
        super();
        this.AddComponent(new PlayerMovementComponent(this));
        this.AddComponent(new ImageDrawDirective(this, "heart", [10, 10]));

        const hitbox = new HitboxPolygon(this, [0, 30], [-10, 0], [0, -10], [10, 0]);
        hitbox.SetTriggerState(TriggerState.NotTrigger);
        this.AddComponent(hitbox);
    }

    Update() {
        super.Update();
        // this.transform.Rotate(0.5);
        // this.transform.position.Transform(Util.FPSReletive(Util.Shake() * 5), Util.FPSReletive(Util.Shake() * 5));
    }
}