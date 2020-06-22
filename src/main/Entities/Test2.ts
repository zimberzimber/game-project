import { EntityBase } from "./EntityBase";
import { DrawDirectiveImageBase } from "../Components/DrawDirectives/DrawDirectiveImageBase";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { TriggerState, CollisionGroup } from "../Models/CollisionModels";
import { HitboxCircle } from "../Components/Hitboxes/HitboxCircle";
import { SoundType, ControllerType } from "../Models/SoundModels";
import { Audio } from "../Workers/SoundPlayer";
import { DrawDirectiveStaticImage } from "../Components/DrawDirectives/DrawDirectiveStaticImage";
import { Camera } from "../Workers/CameraManager";
import { Vec2 } from "../Models/Vectors";
import { SoundComponent } from "../Components/Sound/SoundBase";

export class Test2Entity extends EntityBase {
    constructor(parent: EntityBase | void | null, position: Vec2 = [0, 0], rotation: number = 0, scale: Vec2 = [1, 1]) {
        super(parent, position, rotation, scale);
        this.AddComponent(new DrawDirectiveStaticImage(this, "assetMissing", [10, 10]));

        // const hitbox = new HitboxCircle(this, 50);
        // hitbox.CollisionGroup = CollisionGroup.Hazard;
        // hitbox.CollideWithGroup = CollisionGroup.Hazard | CollisionGroup.Player;

        // hitbox.TriggerState = TriggerState.ContinuousTrigger;
        // hitbox.CollisionScript = (trigerredBy: HitboxBase) => sound.Play();
        // this.AddComponent(hitbox);

        
        const h1 = new HitboxCircle(this, 50);
        this.AddComponent(h1);
        
        const h2 = new HitboxCircle(this, 100);
        this.AddComponent(h2);
        
        const h3 = new HitboxCircle(this, 200);
        this.AddComponent(h3);

        const sound = new SoundComponent(this, 'loop');
        this.AddComponent(sound);
        sound.Play();
    }

    Update() {
        super.Update();
    }
}