import { ParticleComponent } from "../../../Components/Visual/Particle";
import { CollisionGroup, HitboxType, TriggerState } from "../../../Models/CollisionModels";
import { GameEntityBase } from "../../EntityBase";
import { ProjectileBasic } from "../ProjectileBase";

const cfg = {
    speed: 500,
    rotationSpeed: 60,
    timeToLive: 10,
    size: 20,
}

export class ProjectileSeeker extends ProjectileBasic {
    private _target: GameEntityBase | undefined;
    constructor(target: GameEntityBase | void | null) {
        super(cfg.speed, 0, cfg.timeToLive, HitboxType.Circular, cfg.size, CollisionGroup.Projectile, CollisionGroup.Player, TriggerState.OneTimeTrigger);
        this._target = target || undefined;
        this.Speed = cfg.speed;

        new ParticleComponent(this, 'missile_fire').Start();
        this._hitbox.CollideWithGroup = CollisionGroup.Player;
    }

    Update(delta: number) {
        super.Update(delta);

        if (this._target && this._target.IsEnabledByHeirarchy)
            this.Transform.RotateTowards(this._target.Transform.Position, cfg.rotationSpeed * delta);
    }
}