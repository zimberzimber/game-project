import { ProjectileDictionary, ProjectileCollisionDictionary } from "../../../AssetDefinitions/BasicProjectileDefinitions";
import { GameEntityBase } from "../../EntityBase";
import { ProjectileBasic } from "../ProjectileBase";

const rotationSpeed = 60;

export class ProjectileSeeker extends ProjectileBasic {
    private _target: GameEntityBase | undefined;
    constructor(target: GameEntityBase | void | null) {
        super(ProjectileDictionary.basic_seeker, ProjectileCollisionDictionary.enemy_projectile);
        this._target = target || undefined;
    }

    Update(delta: number) {
        super.Update(delta);

        if (this._target && this._target.IsEnabledByHeirarchy)
            this.Transform.RotateTowards(this._target.Transform.Position, rotationSpeed * delta);
    }
}