import { _G } from "../Main";
import { EntityBase } from "../Bases/EntityBase";
import { ImageDrawDirective } from "../DrawDirectives/ImageDrawDirective";
import { HitboxPolygon } from "../Components/HitboxPolygon";
import { HitboxBase } from "../Bases/HitboxBase";
import { TriggerState } from "../Models/TriggerState";
import Vec2Utils from "../Utility/Vec2";
import ScalarUtil from "../Utility/Scalar";
import { HitboxCircle } from "../Components/HitboxCircle";
import { HitboxRectangle } from "../Components/HitboxRectangle";
import SoundManager from "../Workers/SoundManager";

export class TestEntity extends EntityBase {
    constructor(parent: EntityBase | void) {
        super(parent);
        this.AddComponent(new ImageDrawDirective(this, "ass", [10, 10]));

        // const hitbox = new HitboxRectangle(this, 10, 40);
        // const hitbox = new HitboxCircle(this, 10);
        // const hitbox = new HitboxPolygon(this, [0, 10], [-10, 0], [0, -10], [10, 0]);
        const hitbox = new HitboxPolygon(this, [1, -12], [7, -9], [10, -4], [10, 3], [8, 9], [3, 12], [-4, 12], [-10, 9], [-3, 8], [3, 5], [4, -1], [2, -6], [-3, -7], [-10, -7]);


        hitbox.SetTriggerState(TriggerState.OnEnterTrigger);
        hitbox.CollisionScript = (trigerredBy: HitboxBase) => {
            SoundManager.PlaySound('sfx');
        }

        hitbox.UncollisionScript = (TriggerState: HitboxBase) => {
        }

        this.AddComponent(hitbox);
    }

    Update() {
        super.Update();
    }
}