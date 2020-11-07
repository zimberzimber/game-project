import { TimerComponent } from "../../Components/Mechanics/TimerComponent";
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { DrawDirectiveStaticImage } from "../../Components/Visual/DrawDirectiveStaticImage";
import { LightComponent } from "../../Components/Visual/Light";
import { CollisionGroup, HitboxType, TriggerState } from "../../Models/CollisionModels";
import { VerticalAlignment, HorizontalAlignment } from "../../Models/GenericInterfaces";
import { Vec2, Vec3 } from "../../Models/Vectors";
import { GameEntityBase } from "../EntityBase";
import { GameplayInteractiveEntityBase } from "../GameplayInteractiveEntity";

const cfg = {
    health: 10,
    radius: 42,
    spriteSize: [45, 40] as Vec2,
    lightColor: [0.85, 0, 0.75] as Vec3,
    lightRadius: 55,
    lightHardness: 0.5,
}

export class EnemyFloaterEntity extends GameplayInteractiveEntityBase {
    private dd: DrawDirectiveStaticImage;
    private light: LightComponent;

    constructor(parent: GameEntityBase | void | null) {
        super(parent, cfg.health, HitboxType.Circular, cfg.radius, CollisionGroup.Enemy, CollisionGroup.Player, TriggerState.OnEnterTrigger);
        this.dd = new DrawDirectiveStaticImage(this, "floater", cfg.spriteSize);
        this.dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };

        this.light = new LightComponent(this, cfg.lightColor, cfg.lightRadius, cfg.lightHardness);
    }

    Update(delta: number) {
        super.Update(delta);
    }

    OnDied(): void {
        const e = new GameEntityBase();
        const dd = new DrawDirectiveAnimatedImage(e, 'floater_death', cfg.spriteSize);
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