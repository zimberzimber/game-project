import { DrawDirectiveAnimatedImage } from "../../../Components/Visual/DrawDirectiveAnimatedImage";
import { Vec2Utils } from "../../../Utility/Vec2";
import { Camera } from "../../../Workers/CameraManager";
import { Game } from "../../../Workers/Game";
import { Log } from "../../../Workers/Logger";
import { UiEntityBase } from "../../EntityBase";
import { PlayerEntity } from "../../Player/PlayerRoot";

export class ResourcesInterface extends UiEntityBase {
    private hp_dds: DrawDirectiveAnimatedImage[] = [];
    private energy_dds: DrawDirectiveAnimatedImage[] = [];
    private player: PlayerEntity;
    private oldHp: number;
    private oldEnergy: number;

    constructor() {
        super();

        this.player = Game.GetEntitiesOfType(PlayerEntity, false)[0];
        if (!this.player) {
            Log.Error('Created resource interface without a player. Aborting.');
            this.Enabled = false;
            return;
        }

        this.Transform.Position = Vec2Utils.MultS(Camera.Transform.Scale, -0.5);

        const hp = this.player.Health;
        for (let i = 0; i < hp[1]; i++) {
            const dd = new DrawDirectiveAnimatedImage(this, 'health_bar', 2);
            dd.DrawOffset = [10 + ((13 - 6) * 3 * i), 10];
            dd.Frame = "full";
            dd.Opacity = hp[0] <= i ? 0.33 : 1;
            this.hp_dds.push(dd);
        }

        const energy = this.player.Energy;
        for (let i = 0; i < energy[1]; i++) {
            const dd = new DrawDirectiveAnimatedImage(this, 'energy_bar', 2);
            dd.DrawOffset = [10 + ((13 - 6) * 3 * i), -10];
            dd.Frame = "full";
            dd.Opacity = energy[0] <= i ? 0.33 : 1;
            this.energy_dds.push(dd);
        }

        this.oldHp = hp[0];
    }

    Update(dt: number): void {
        super.Update(dt);

        // Checking for health and energy changes through Update and not a callback as to prevent multiple redundant calls at once
        const hp = this.player.Health;
        if (hp[0] != this.oldHp) {
            for (let i = 0; i < this.hp_dds.length; i++)
                this.hp_dds[i].Opacity = hp[0] <= i ? 0.33 : 1;
            this.oldHp = hp[0];
        }
    }
}