import { _G } from "../Main";
import { EntityBase } from "../Bases/EntityBase";
import { ImageDrawDirective } from "../DrawDirectives/ImageDrawDirective";
import { HitboxPolygon } from "../Components/HitboxPolygon";
import { HitboxBase } from "../Bases/HitboxBase";
import { TriggerState } from "../Models/TriggerState";

export class TestEntity extends EntityBase {
    constructor() {
        super();
        this.AddComponent(new ImageDrawDirective(this, "ass", [50, 50]));

        const hitbox = new HitboxPolygon(this, [0, 10], [-10, 0], [0, -10], [10, 0]);

        hitbox.SetTriggerState(TriggerState.OnEnterTrigger);
        hitbox.CollisionScript = (trigerredBy: HitboxBase) => {
            console.log('Ding!');
        }

        hitbox.UncollisionScript = (TriggerState: HitboxBase) => {
            console.log('Dong!');
        }

        this.AddComponent(hitbox);
    }

    Update() {
        super.Update();
        // this.transform.RotateTowardsEntity(_G.Game.playerEntity, Util.FPSReletive(180));
        // this.transform.MoveForward(Util.FPSReletive(300));
    }
}