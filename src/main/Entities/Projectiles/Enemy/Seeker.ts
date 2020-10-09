import { ParticleComponent } from "../../../Components/Visual/Particle";
import { GameEntityBase } from "../../EntityBase";
import { ProjectileBasic } from "../ProjectileBase";

export class ProjectileSeeker extends ProjectileBasic {
    private _target: GameEntityBase;
    constructor(target: GameEntityBase) {
        super();
        this._target = target;
        this.Speed = 500;

        new ParticleComponent(this, 'missile_fire').Start();
    }

    Update(delta: number) {
        super.Update(delta);

        if (this._target && this._target.IsEnabledByHeirarchy)
            this.Transform.RotateTowards(this._target.Transform.Position, 60 * delta);
    }
}