import { DrawDirectiveStaticImage } from "../../../Components/Visual/DrawDirectiveStaticImage";
import { ParticleComponent } from "../../../Components/Visual/Particle";
import { CollisionGroup, HitboxType, TriggerState } from "../../../Models/CollisionModels";
import { HorizontalAlignment, VerticalAlignment } from "../../../Models/GenericInterfaces";
import { Vec2 } from "../../../Models/Vectors";
import { Vec2Utils } from "../../../Utility/Vec2";
import { GameplayInteractiveEntityBase } from "../../GameplayInteractiveEntity";
import { PlayerEntity } from "../../Player/PlayerRoot";
import { ProjectileBasic } from "../ProjectileBase";

const cfg = {
    speed: 600,
    timeToLive: 10,
    spriteSize: 50,
    hitboxSize: [50, 10] as Vec2,
}

// export class ProjectilePlayerTest extends ProjectileBasic {
//     private _particle: ParticleComponent;
//     private _dd: DrawDirectiveStaticImage

//     constructor() {
//         super(cfg.speed, 0, cfg.timeToLive, HitboxType.Rectangular, cfg.hitboxSize, CollisionGroup.Projectile, CollisionGroup.Enemy, TriggerState.OneTimeTrigger);

//         this._particle = new ParticleComponent(this, 'ori_arrow_trail');
//         this._particle.Start();

//         this._dd = new DrawDirectiveStaticImage(this, 'ori_arrow', [cfg.spriteSize, cfg.spriteSize]);
//         this._dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };

//         this._hitbox.CollisionScript = (e) => {
//             (e.Parent as GameplayInteractiveEntityBase).Damage(1);

//             if (this._particle.IsEmitting) {
//                 this._hitbox.Enabled = false;
//                 this._dd.Enabled = false;
//                 this._particle.OnEnded = () => this.Delete();
//                 this._particle.Stop();
//             } else
//                 this.Delete();
//         }
//     }
// }