import { TimerComponent } from "../../../Components/Mechanics/TimerComponent";
import { DrawDirectiveAnimatedImage } from "../../../Components/Visual/DrawDirectiveAnimatedImage";
import { DrawDirectiveCircle } from "../../../Components/Visual/DrawDirectiveCircle";
import { DrawDirectiveStaticImage } from "../../../Components/Visual/DrawDirectiveStaticImage";
import { HorizontalAlignment, VerticalAlignment } from "../../../Models/GenericInterfaces";
import { Vec2 } from "../../../Models/Vectors";
import { AlignmentUtility } from "../../../Utility/Alignment";
import { Vec2Utils } from "../../../Utility/Vec2";
import { Camera } from "../../../Workers/CameraManager";
import { Game } from "../../../Workers/Game";
import { Log } from "../../../Workers/Logger";
import { UiEntityBase } from "../../EntityBase";
import { PlayerEntity } from "../../Player/PlayerRoot";
import { ParticleFireAndForgetUiEntity } from "../../Visual/Particle";

const scale = 2;
const barOffset: Vec2 = [6, 3];
const rootSpacing: Vec2 = [2, 6];
const barSpacing: Vec2 = [11, 6];
const barAddDelay = 0.15;

export class ResourcesInterface extends UiEntityBase {
    private hp_dds: DrawDirectiveAnimatedImage[] = [];
    private energy_dds: DrawDirectiveAnimatedImage[] = [];
    private player: PlayerEntity;
    private oldHp: number;
    private oldEnergy: number;
    // private oldEnergy: number;

    constructor() {
        super();

        this.player = Game.GetEntitiesOfType(PlayerEntity, false)[0];
        if (!this.player) {
            Log.Error('Created resource interface without a player. Aborting.');
            this.Enabled = false;
            return;
        }

        const hp = this.player.Health;
        const energy = this.player.Energy;
        this.oldHp = hp[0];
        this.oldEnergy = energy[0];

        const bottomCenter = Camera.Transform.Scale[1] * -0.5;
        this.Transform.SetTransformParams([0, bottomCenter], null, [scale, scale], -10);

        const wepDis = new DrawDirectiveStaticImage(this, "weapon_display");
        AlignmentUtility.BottomMiddle(wepDis);

        const hp_dd_root = new DrawDirectiveAnimatedImage(this, 'health_bar_root');
        AlignmentUtility.BottomLeft(hp_dd_root);
        hp_dd_root.DrawOffset = barOffset;
        hp_dd_root.Frame = "full";

        const energy_dd_root = new DrawDirectiveAnimatedImage(this, 'energy_bar_root');
        AlignmentUtility.BottomRight(energy_dd_root);
        energy_dd_root.DrawOffset = [-barOffset[0], barOffset[1]];
        energy_dd_root.Frame = "full";

        // for (let i = 0; i < hp[1]; i++) {
        //     const dd = new DrawDirectiveAnimatedImage(this, 'health_bar');
        //     AlignmentUtility.BottomLeft(dd);
        //     dd.DrawOffset = [barOffset[0] + rootLength + barLength * i, barOffset[1]];
        //     dd.Frame = "full";
        //     this.hp_dds.push(dd);
        // }
        // for (let i = 0; i < energy[1]; i++) {
        //     const dd = new DrawDirectiveAnimatedImage(this, 'energy_bar');
        //     AlignmentUtility.BottomRight(dd);
        //     dd.DrawOffset = [-barOffset[0] - rootLength - barLength * i, barOffset[1]];
        //     dd.Frame = "full";
        //     this.energy_dds.push(dd);
        // }

        let i = 0;
        const addTimer = new TimerComponent(this, barAddDelay, true);
        addTimer.OnTimesUpCallback = () => {
            let stop = true;

            const hp = this.player.Health;
            if (i < hp[1]) {
                const dd = new DrawDirectiveAnimatedImage(this, 'health_bar');
                AlignmentUtility.BottomLeft(dd);
                dd.DrawOffset = [barOffset[0] + rootSpacing[0] + barSpacing[0] * i, barOffset[1]];
                dd.Frame = hp[0] <= i ? "empty" : "full";
                this.hp_dds.push(dd);

                stop = false;
            }

            const energy = this.player.Energy;
            if (i < energy[1]) {
                const dd = new DrawDirectiveAnimatedImage(this, 'energy_bar');
                AlignmentUtility.BottomRight(dd);
                dd.DrawOffset = [-barOffset[0] - rootSpacing[0] - barSpacing[0] * i, barOffset[1]];
                dd.Frame = energy[0] <= i ? "empty" : "full";
                this.energy_dds.push(dd);

                stop = false;
            }

            if (stop)
                this.RemoveComponent(addTimer);
            else
                i++;
        }
        addTimer.Start();

    }

    Update(dt: number): void {
        super.Update(dt);

        let position: Vec2;

        // Checking for health and energy changes through Update and not a callback as to prevent multiple redundant calls at once
        const hp = this.player.Health[0];
        if (hp != this.oldHp) {
            position = this.WorldRelativeTransform.Position;

            for (let i = 0; i < this.hp_dds.length; i++) {
                this.hp_dds[i].Frame = hp <= i ? "empty" : "full";

                if (i + 1 <= this.oldHp && i + 1 > hp) {
                    const p = new ParticleFireAndForgetUiEntity("health_shatter_splash");
                    const offset: Vec2 = [
                        position[0] + (barOffset[0] + rootSpacing[0] + barSpacing[0] * (i + 1) - barSpacing[0] * 0.5) * scale,
                        position[1] + (barOffset[1] + barSpacing[1] * 0.5) * scale
                    ];

                    p.Transform.Position = offset;
                    p.Burst();
                }
            }
            this.oldHp = hp;
        }

        const energy = this.player.Energy[0];
        if (energy != this.oldEnergy) {
            position = position! || this.WorldRelativeTransform.Position;
            for (let i = 0; i < this.energy_dds.length; i++)
                this.energy_dds[i].Frame = energy <= i ? "empty" : "full";
            this.oldEnergy = energy;
        }
    }
}