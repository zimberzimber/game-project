import { ProjectileDictionary, ProjectileCollisionDictionary } from "../../../AssetDefinitions/BasicProjectileDefinitions";
import { HitboxBase } from "../../../Components/Hitboxes/HitboxBase";
import { TriggerState } from "../../../Models/CollisionModels";
import { Vec2Utils } from "../../../Utility/Vec2";
import { SpecialExplosionDamageZoneEntity } from "../../DamageZones/SpecialExplosion";
import { GameEntityBase } from "../../EntityBase";
import { GameplayInteractiveEntityBase } from "../../GameplayInteractiveEntity";
import { ProjectileBase } from "../ProjectileBase";

const initialSpeed = 1000;
const speedDecay = 800;
const speedDecayMultiplier = 0.5;
const damage = 1;

export class ProjectileOriStar extends ProjectileBase {
    private _owner: GameEntityBase;
    private _speed: number = initialSpeed;
    private _goingBack: boolean = false;
    private _angle: number = 0;

    constructor(ownerEntity: GameEntityBase, angle: number) {
        super(ProjectileDictionary.ori_star, ProjectileCollisionDictionary.player_projectile);
        this._owner = ownerEntity;
        this._angle = angle;

        const ot = ownerEntity.WorldRelativeTransform;
        this.Transform.SetTransformParams(ot.Position, null, null, ot.Depth);

        this._hitbox.TriggerState = TriggerState.OneTimeTrigger;

        this._hitbox.CollisionScript = (trigerredBy: HitboxBase) => {
            if (trigerredBy.Parent instanceof GameplayInteractiveEntityBase)
                trigerredBy.Parent.Damage(damage);
        };
    }

    Update(delta: number) {
        super.Update(delta);

        if (!this.Enabled) return;

        if (this._goingBack) {
            const ownerPos = this._owner.WorldRelativeTransform.Position;

            if (this._owner && this._owner.IsEnabledByHeirarchy)
                this.Transform.MoveTowards(ownerPos, this._speed * delta, false);

            if (Vec2Utils.Distance(ownerPos, this.Transform.Position) <= 0)
                this.DeleteProjectile();
            else {
                this.Transform.Rotate(this._speed * -delta);
                this._speed += (this._speed * speedDecayMultiplier + speedDecay) * delta;
            }
        } else {
            // Transforms 
            const t = this.Transform;
            const p = Vec2Utils.Sum(t.Position, Vec2Utils.RotatePoint([this._speed * delta, 0], this._angle));
            t.SetTransformParams(p, t.Rotation + this._speed * delta, null, null);

            this._speed -= (this._speed * speedDecayMultiplier + speedDecay) * delta;


            if (this._speed <= 0) {
                this._goingBack = true;

                // Resets hit targets
                this._hitbox.TriggerState = TriggerState.OneTimeTrigger;
            }
        }
    }

    Explode(): void {
        // spawn explosion
        const t = this.WorldRelativeTransform;
        new SpecialExplosionDamageZoneEntity(t.Position, t.Depth);
        this.DeleteProjectile();
    }
}