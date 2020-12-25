import { HitboxBase } from "../../Components/Hitboxes/HitboxBase";
import { HitboxCircle } from "../../Components/Hitboxes/HitboxCircle";
import { CollisionGroup, TriggerState } from "../../Models/CollisionModels";
import { Transform } from "../../Models/Transform";
import { Vec2 } from "../../Models/Vectors";
import { ScalarUtil } from "../../Utility/Scalar";
import { GameEntityBase } from "../EntityBase";
import { GameplayInteractiveEntityBase } from "../GameplayInteractiveEntity";
import { ParticleFireAndForgetEntity } from "../Visual/Particle";

const growthRate = 600;
const damage = 10;
const lifespan = 0.15;

export class SpecialExplosionDamageZoneEntity extends GameEntityBase {
    private _hitbox: HitboxCircle;
    private _time: number = 0;

    constructor(position: Vec2, depth: number) {
        super();

        this.Transform.SetTransformParams(position, null, null, depth);

        const p = new ParticleFireAndForgetEntity("ori_special_explosion_shockwave");
        p.Transform.SetTransformParams(position, null, null, depth);
        p.Burst();

        this._hitbox = new HitboxCircle(this, 0);
        this._hitbox.TriggerState = TriggerState.OneTimeTrigger;
        this._hitbox.CollideWithGroup = CollisionGroup.Enemy;
        this._hitbox.CollisionScript = (trig: HitboxBase) => {
            if (trig.Parent instanceof GameplayInteractiveEntityBase)
                trig.Parent.Damage(damage);
        }
    }

    Update(dt: number) {
        super.Update(dt);
        this._hitbox.Radius += growthRate * dt;
        this._time += dt;

        if (this._time >= lifespan)
            this.Delete();
    }
}