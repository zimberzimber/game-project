import { EntityBase } from "./EntityBase";
import { DrawDirectiveImageBase } from "../Components/DrawDirectives/DrawDirectiveImageBase";
import { HitboxPolygon } from "../Components/Hitboxes/HitboxPolygon";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { TriggerState, CollisionGroup } from "../Models/CollisionModels";
import { Vec2Utils } from "../Utility/Vec2";
import { ScalarUtil } from "../Utility/Scalar";
import { HitboxCircle } from "../Components/Hitboxes/HitboxCircle";
import { HitboxRectangle } from "../Components/Hitboxes/HitboxRectangle";
import { SoundType } from "../Models/SoundModels";
import { Audio } from "../Workers/SoundPlayer";
import { DrawDirectiveStaticImage } from "../Components/DrawDirectives/DrawDirectiveStaticImage";
import { Light } from "../Components/Light/Light";
import { Vec2 } from "../Models/Vectors";
import { SoundComponent } from "../Components/Sound/SoundBase";
import { DrawDirectiveText } from "../Components/DrawDirectives/DrawDirectiveText";

export class TestEntity extends EntityBase {
    constructor(parent: EntityBase | void | null, position: Vec2 = [0, 0], rotation: number = 0, scale: Vec2 = [1, 1]) {
        super(parent, position, rotation, scale);
        this.transform.Depth = -5;
        this.AddComponent(new DrawDirectiveStaticImage(this, "heart", [10, 10]));

        // const hitbox = new HitboxRectangle(this, 10, 40);
        // const hitbox = new HitboxCircle(this, 10);
        // const hitbox = new HitboxPolygon(this, [0, 10], [-10, 0], [0, -10], [10, 0]);
        const hitbox = new HitboxPolygon(this, [1, -12], [7, -9], [10, -4], [10, 3], [8, 9], [3, 12], [-4, 12], [-10, 9], [-3, 8], [3, 5], [4, -1], [2, -6], [-3, -7], [-10, -7]);
        hitbox.CollisionGroup = CollisionGroup.Hazard;
        hitbox.CollideWithGroup = CollisionGroup.Player;

        const sound = new SoundComponent(this, 'sfx');
        this.AddComponent(sound);

        hitbox.TriggerState = TriggerState.OnEnterTrigger;
        hitbox.CollisionScript = (trigerredBy: HitboxBase) => sound.Play();

        this.AddComponent(hitbox);
        this.AddComponent(new Light(this, [1, 0, 0], 50, 1));
    }

    Update(delta: number) {
        super.Update(delta);
    }
}