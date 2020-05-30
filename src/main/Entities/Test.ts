import { EntityBase } from "../Bases/EntityBase";
import { ImageDrawDirective } from "../Components/DrawDirectives/ImageDrawDirective";
import { HitboxPolygon } from "../Components/Hitboxes/HitboxPolygon";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { TriggerState, CollisionGroup } from "../Models/CollisionModels";
import { Vec2Utils } from "../Utility/Vec2";
import { ScalarUtil } from "../Utility/Scalar";
import { HitboxCircle } from "../Components/Hitboxes/HitboxCircle";
import { HitboxRectangle } from "../Components/Hitboxes/HitboxRectangle";
import { SoundTags } from "../Models/SoundModels";
import { Audio } from "../Workers/SoundPlayer";
import { StaticImageDrawDirective } from "../Components/DrawDirectives/StaticImageDrawDirective";

export class TestEntity extends EntityBase {
    constructor(parent: EntityBase | void) {
        super(parent);
        this.transform.Depth = -5;
        this.AddComponent(new StaticImageDrawDirective(this, "assetMissing", [10, 10]));

        // const hitbox = new HitboxRectangle(this, 10, 40);
        // const hitbox = new HitboxCircle(this, 10);
        // const hitbox = new HitboxPolygon(this, [0, 10], [-10, 0], [0, -10], [10, 0]);
        const hitbox = new HitboxPolygon(this, [1, -12], [7, -9], [10, -4], [10, 3], [8, 9], [3, 12], [-4, 12], [-10, 9], [-3, 8], [3, 5], [4, -1], [2, -6], [-3, -7], [-10, -7]);
        hitbox.CollisionGroup = CollisionGroup.Hazard;
        hitbox.CollideWithGroup = CollisionGroup.Player;

        hitbox.TriggerState = TriggerState.OnEnterTrigger;
        hitbox.CollisionScript = (trigerredBy: HitboxBase) => {

            Audio.PlaySound({
                soundSourceName: 'sfx',
                volume: 1,
                playbackRate: 1,
                loop: false,
                tag: SoundTags.Default
            });
        }

        hitbox.UncollisionScript = (TriggerState: HitboxBase) => {
        }

        this.AddComponent(hitbox);
    }

    Update() {
        super.Update();
    }
}