import { TimerComponent } from "../../Components/Mechanics/TimerComponent";
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { DrawDirectiveStaticImage } from "../../Components/Visual/DrawDirectiveStaticImage";
import { LightComponent } from "../../Components/Visual/Light";
import { HitboxType } from "../../Models/CollisionModels";
import { VerticalAlignment, HorizontalAlignment } from "../../Models/GenericInterfaces";
import { GameEntityBase } from "../EntityBase";
import { EnemyBaseEntity } from "./EnemyBase";

export class EnemyFloaterEntity extends EnemyBaseEntity {
    private dd: DrawDirectiveStaticImage;
    private light: LightComponent;

    constructor(parent: GameEntityBase | void | null) {
        super(parent, 10, HitboxType.Circular, 42);
        this.dd = new DrawDirectiveStaticImage(this, "floater", [45, 40]);
        this.dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };

        this.light = new LightComponent(this, [0.85, 0, 0.75], 55, 0.5);
    }

    Update(delta: number) {
        super.Update(delta);
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