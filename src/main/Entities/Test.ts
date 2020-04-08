import { _G } from "../Main";
import { EntityBase } from "../Bases/EntityBase";
import { ImageDrawDirective } from "../DrawDirectives/ImageDrawDirective";
import { HitboxPolygon } from "../Components/HitboxPolygon";
import { HitboxBase } from "../Bases/HitboxBase";
import { TriggerState } from "../Models/TriggerState";
import Vec2Utils from "../Utility/Vec2";
import ScalarUtil from "../Utility/Scalar";
import { HitboxCircle } from "../Components/HitboxCircle";

export class TestEntity extends EntityBase {
    constructor(parent: EntityBase | void) {
        super(parent);
        this.AddComponent(new ImageDrawDirective(this, "ass", [10, 10]));

        // const hitbox = new HitboxPolygon(this, [0, 10], [-10, 0], [0, -10], [10, 0]);
        const hitbox = new HitboxCircle(this, 10);

        hitbox.SetTriggerState(TriggerState.ContinuousTrigger);
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
    }
}