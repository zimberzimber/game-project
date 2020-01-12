import { _G } from "../Main";
import { EntityBase } from "../Bases/EntityBase";
import { ImageDrawDirective } from "../DrawDirectives/ImageDrawDirective";
import { HitboxPolygon } from "../Components/HitboxPolygon";
import { Vec2 } from "../Models/Vec2";
import { DrawLayer } from "../Models/DrawLayer";
import { Util } from "../Utility";
import { HitboxBase } from "../Bases/HitboxBase";
import { TriggerState } from "../Models/TriggerState";
import { HitboxRectangle } from "../Components/HitboxRectangle";
import { HitboxCircle } from "../Components/HitboxCircle";

export class TestEntity extends EntityBase {
    constructor() {
        super();
        this.AddComponent(new ImageDrawDirective(this, DrawLayer.Midground, "player"));

        const hitbox = new HitboxPolygon(this, new Vec2(-15, 0), new Vec2(0, 15), new Vec2(15, 0), new Vec2(0, -15));

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