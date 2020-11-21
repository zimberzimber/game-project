import { ProjectileCollisionDictionary, ProjectileDictionary } from "../../../AssetDefinitions/BasicProjectileDefinitions";
import { ProjectileBasic } from "../ProjectileBase";

const angleDecay = 33;

export class ProjectileSpiderSpit extends ProjectileBasic {
    constructor() {
        super(ProjectileDictionary.spider_spit, ProjectileCollisionDictionary.enemy_projectile);
    }

    Update(dt: number) {
        super.Update(dt);

        if (this.Enabled) {
            const rot = this.Transform.Rotation;

            if (rot > 90)
                this.Transform.Rotate(Math.min(270 - rot, angleDecay * dt));
            else if (rot > -90)
                this.Transform.Rotate(Math.max(-90 - rot, -angleDecay * dt));
            else
                this.Transform.Rotate(Math.min(-90 - rot, angleDecay * dt));
        }
    }
}