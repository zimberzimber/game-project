import { EntityBase } from "../Bases/EntityBase";
import { PlayerMovementComponent } from "../Components/PlayerMovementComponent";
import { ImageDrawDirective } from "../Components/DrawDirectives/ImageDrawDirective";
import { TriggerState, CollisionGroup } from "../Models/CollisionModels";
import { HitboxPolygon } from "../Components/Hitboxes/HitboxPolygon";
import { Vec2Utils } from "../Utility/Vec2";
import { ScalarUtil } from "../Utility/Scalar";
import { HitboxCircle } from "../Components/Hitboxes/HitboxCircle";
import { HitboxRectangle } from "../Components/Hitboxes/HitboxRectangle";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { StaticImageDrawDirective } from "../Components/DrawDirectives/StaticImageDrawDirective";
import { AnimatedImageDrawDirective } from "../Components/DrawDirectives/AnimatedImageDrawDirective";
import { SpriteDefinitions } from "../AssetDefinitions/SpriteDefinitions";
import { Light } from "../Components/Light/Light";

export class PlayerEntity extends EntityBase {
    dd: AnimatedImageDrawDirective;
    constructor(parent: EntityBase | void) {
        super(parent);
        this.transform.Depth = -50;
        this.transform.Scale = [3, 3];

        this.AddComponent(new PlayerMovementComponent(this));
        // this.AddComponent(new StaticImageDrawDirective(this, "heart", [10, 10]));
        this.dd = new AnimatedImageDrawDirective(this, "dice", [10, 10])
        this.AddComponent(this.dd);

        // const hitbox = new HitboxRectangle(this, 40, 10);
        // const hitbox = new HitboxCircle(this, 10);
        // const hitbox = new HitboxPolygon(this, [0, 30], [-10, 0], [0, -10], [10, 0]);
        const hitbox = new HitboxPolygon(this, [1, -12], [7, -9], [10, -4], [10, 3], [8, 9], [3, 12], [-4, 12], [-10, 9], [-3, 8], [3, 5], [4, -1], [2, -6], [-3, -7], [-10, -7]);
        hitbox.CollisionGroup = CollisionGroup.Player;
        hitbox.CollideWithGroup = CollisionGroup.Hazard;
        hitbox.TriggerState = TriggerState.NotTrigger;
        hitbox.CollisionScript = (e: HitboxBase): void => {
            // e.Parent.transform.MoveTowards(this.transform.Position, -5);
        }
        this.AddComponent(hitbox);
        this.AddComponent(new Light(this, [1, 1, 1], 100, 0.5));
    }

    Update() {
        super.Update();
        // this.transform.Rotate(0.5);
        // this.transform.position = Vec2Utils.Transform(this.transform.position, ScalarUtil.Shake() * 0.5, ScalarUtil.Shake() * 0.5);
    }
}