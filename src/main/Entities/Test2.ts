import { EntityBase } from "../Bases/EntityBase";
import { ImageDrawDirective } from "../Components/DrawDirectives/ImageDrawDirective";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { TriggerState, CollisionGroup } from "../Models/CollisionModels";
import { HitboxCircle } from "../Components/Hitboxes/HitboxCircle";
import { SoundTags } from "../Models/SoundModels";
import { Audio } from "../Workers/SoundPlayer";

export class Test2Entity extends EntityBase {
    constructor(parent: EntityBase | void) {
        super(parent);
        this.AddComponent(new ImageDrawDirective(this, "assetMissing", [10, 10]));

        const hitbox = new HitboxCircle(this, 10);
        hitbox.CollisionGroup = CollisionGroup.Hazard;
        hitbox.CollideWithGroup = CollisionGroup.Hazard | CollisionGroup.Player;

        hitbox.TriggerState = TriggerState.ContinuousTrigger;
        hitbox.CollisionScript = (trigerredBy: HitboxBase) => {
            // Audio.PlaySound({
            //     soundSourceName: 'sfx',
            //     volume: 1,
            //     playbackRate: 2,
            //     loop: false,
            //     tag: SoundTags.Default
            // });
            // console.log('bop');
            
        }

        hitbox.UncollisionScript = (TriggerState: HitboxBase) => {
        }

        this.AddComponent(hitbox);
    }

    Update() {
        super.Update();
    }
}