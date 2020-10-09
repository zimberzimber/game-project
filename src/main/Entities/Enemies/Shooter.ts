import { SimpleAnimatorComponent, TimerComponent } from "../../Components/Mechanics/TimerComponent";
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { HitboxType } from "../../Models/CollisionModels";
import { VerticalAlignment, HorizontalAlignment } from "../../Models/GenericInterfaces";
import { GameEntityBase } from "../EntityBase";
import { ProjectileSeeker } from "../Projectiles/Enemy/Seeker";
import { EnemyBaseEntity } from "./EnemyBase";

export class EnemyShooter extends EnemyBaseEntity {
    private dd: DrawDirectiveAnimatedImage;

    constructor(parent: GameEntityBase | void | null) {
        super(parent, 10, HitboxType.Polygonal, [[20, 25], [-20, 25], [-20, -25], [20, -25]]);
        this.dd = new DrawDirectiveAnimatedImage(this, "enemy", [40, 50]);
        this.dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };

        new SimpleAnimatorComponent(this, 0.1, true, this.dd, 4).Start();

        let fired = 0;

        const shootTimer = new TimerComponent(this, 0.1, true);
        shootTimer.OnTimesUpCallback = () => {
            fired++;
            const p = new ProjectileSeeker(this);
            p.Transform.Rotation = Math.random() * 90 + 45;

            if (fired >= 5)
                shootTimer.Stop();
        };

        const burstTimer = new TimerComponent(this, 3, true);
        burstTimer.OnTimesUpCallback = () => {
            fired = 0;
            shootTimer.Restart();
        };
        burstTimer.Start();
    }

    Update(delta: number) {
        super.Update(delta);
        this.Transform.Rotate(10 * delta);
    }

    OnDied(): void {
        const e = new GameEntityBase();
        const dd = new DrawDirectiveAnimatedImage(e, 'floater_death', [45, 40]);
        dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        const t = new TimerComponent(e, 0.1, true);
        e.Transform.CopyFromTransform(this.Transform);
        t.OnTimesUpCallback = () => {
            const next = dd.FrameId + 1;
            if (next < 3)
                dd.Frame = next;
            else
                e.Delete();
        }
        t.Start();
        super.OnDied();
    }
}