import { _G } from "../Main";
import { EntityBase } from "../Bases/EntityBase";
import { PlayerMovementComponent } from "../Components/PlayerMovementComponent";
import { ImageDrawDirective } from "../DrawDirectives/ImageDrawDirective";
import { HitboxCircle } from "../Components/HitboxCircle";
import { DrawLayer } from "../Models/DrawLayer";
import { HitboxRectangle } from "../Components/HitboxRectangle";
import { TriggerState } from "../Models/TriggerState";
import { HitboxPolygon } from "../Components/HitboxPolygon";
import { Vec2 } from "../Models/Vec2";

export class PlayerEntity extends EntityBase {
    constructor() {
        super();
        this.AddComponent(new PlayerMovementComponent(this));
        this.AddComponent(new ImageDrawDirective(this, DrawLayer.Midground, "player"));

        const hitbox = new HitboxPolygon(this, new Vec2(-15, 0), new Vec2(0, 15), new Vec2(15, 0), new Vec2(0, -15));
        hitbox.SetTriggerState(TriggerState.NotTrigger);
        this.AddComponent(hitbox);
    }

    Update() {
        super.Update();
        this.transform.Rotate(0.5);
        // this.transform.position.Transform(Util.FPSReletive(Util.Shake() * 5), Util.FPSReletive(Util.Shake() * 5));
    }
}