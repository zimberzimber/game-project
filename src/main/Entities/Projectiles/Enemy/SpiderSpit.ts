import { DrawDirectiveStaticImage } from "../../../Components/Visual/DrawDirectiveStaticImage";
import { ParticleComponent } from "../../../Components/Visual/Particle";
import { CollisionGroup, HitboxType, TriggerState } from "../../../Models/CollisionModels";
import { HorizontalAlignment, VerticalAlignment } from "../../../Models/GenericInterfaces";
import { Vec2Utils } from "../../../Utility/Vec2";
import { PlayerEntity } from "../../Player/PlayerRoot";
import { ProjectileBasic } from "../ProjectileBase";

const cfg = {
    speed: 300,
    timeToLive: 10,
    spriteSize: 15,
    hitboxRadius: 10,
    angleDecay: 33
}

export class ProjectileSpiderSpit extends ProjectileBasic {
    constructor() {
        super(cfg.speed, 0, cfg.timeToLive, HitboxType.Circular, cfg.hitboxRadius, CollisionGroup.Projectile, CollisionGroup.Player, TriggerState.OneTimeTrigger);
        new ParticleComponent(this, 'spider_spit_trails').Start();
        const dd = new DrawDirectiveStaticImage(this, 'pentagon_purple', [cfg.spriteSize, cfg.spriteSize]);
        dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        this._hitbox.CollisionScript = (e) => {
            (e.Parent as PlayerEntity).Damage(1);
            this.Delete();
        }
    }

    Update(dt: number) {
        super.Update(dt);

        if (this.Enabled) {
            const rot = this.Transform.Rotation;

            if (rot > 90)
                this.Transform.Rotate(Math.min(270 - rot, cfg.angleDecay * dt));
            else if (rot > -90)
                this.Transform.Rotate(Math.max(-90 - rot, -cfg.angleDecay * dt));
            else
                this.Transform.Rotate(Math.min(-90 - rot, cfg.angleDecay * dt));
        }
    }
}