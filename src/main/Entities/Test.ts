import { GameEntityBase } from "./EntityBase";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { TriggerState, CollisionGroup } from "../Models/CollisionModels";
import { HitboxRectangle } from "../Components/Hitboxes/HitboxRectangle";
import { DrawDirectiveStaticImage } from "../Components/Visual/DrawDirectiveStaticImage";
import { LightComponent } from "../Components/Visual/Light";
import { SoundSingleInstanceComponent } from "../Components/Sound/SoundSingleInstance";

export class TestEntity extends GameEntityBase {
    constructor(parent: GameEntityBase | void | null) {
        super(parent);
        this.transform.Depth = -5;
        this.AddComponent(new DrawDirectiveStaticImage(this, "spikes", [17, 9]));

        const hitbox = new HitboxRectangle(this, 17, 10);
        hitbox.CollisionGroup = CollisionGroup.Hazard;
        hitbox.CollideWithGroup = CollisionGroup.Player;

        const sound = new SoundSingleInstanceComponent(this, 'sfx', true);
        this.AddComponent(sound);

        hitbox.TriggerState = TriggerState.OnEnterTrigger;
        hitbox.CollisionScript = (trigerredBy: HitboxBase) => sound.Play();

        this.AddComponent(hitbox);
        this.AddComponent(new LightComponent(this, [0.25, 0, 0.25], 50, 0));
    }

    Update(delta: number) {
        super.Update(delta);
    }
}