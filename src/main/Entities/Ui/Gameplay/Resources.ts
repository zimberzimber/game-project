import { TimerComponent } from "../../../Components/Mechanics/TimerComponent";
import { DrawDirectiveAnimatedImage } from "../../../Components/Visual/DrawDirectiveAnimatedImage";
import { DrawDirectiveStaticImage } from "../../../Components/Visual/DrawDirectiveStaticImage";
import { ParticleComponent } from "../../../Components/Visual/Particle";
import { HammerChargeState, HammerSwingState, MeleeRestState, SwordIdleState, SwordSlashState } from "../../../Models/PlayerWeaponStates/Melee";
import { RangedIdleState } from "../../../Models/PlayerWeaponStates/Ranged";
import { SpecialState } from "../../../Models/PlayerWeaponStates/Special";
import { Vec2 } from "../../../Models/Vectors";
import { AlignmentUtility } from "../../../Utility/Alignment";
import { Camera } from "../../../Workers/CameraManager";
import { Game } from "../../../Workers/Game";
import { Log } from "../../../Workers/Logger";
import { UiEntityBase } from "../../EntityBase";
import { PlayerEntity } from "../../Player/PlayerRoot";

const scale = 2;
const barOffset: Vec2 = [9, 6];
const rootSpacing: Vec2 = [2, 6];
const barSpacing: Vec2 = [11, 6];
const barAddDelay = 0.15;
const barStartOffset: Vec2 = [10, 0];
const barSpeed: Vec2 = [60, 0];
const fadeInSpeed = 2;
const weaponIconOffset: Vec2 = [0, 8.5];

const iconDict = {
    [SwordIdleState.name]: "melee",
    [RangedIdleState.name]: "ranged",
    [SpecialState.name]: "special",
}

export class ResourcesInterface extends UiEntityBase {
    private _hp_dds: DrawDirectiveAnimatedImage[] = [];
    private _energy_dds: DrawDirectiveAnimatedImage[] = [];
    private _weaponIcon: DrawDirectiveAnimatedImage;
    private _player: PlayerEntity;
    private _oldHp: number;
    private _oldEnergy: number;
    private _oldState: string;
    private _initializing: boolean = true;

    private _damageParticle: ParticleComponent;
    private _energyUseParticle: ParticleComponent;

    constructor() {
        super();

        this._player = Game.GetEntitiesOfType(PlayerEntity, false)[0];
        if (!this._player) {
            Log.Error('Created resource interface without a player. Aborting.');
            this.Enabled = false;
            return;
        }

        this._damageParticle = new ParticleComponent(this, "health_shatter_splash");
        this._damageParticle.DepthOffset = 1;

        this._energyUseParticle = new ParticleComponent(this, "energy_shatter_splash");
        this._energyUseParticle.DepthOffset = 2;

        const hp = this._player.Health;
        const energy = this._player.Energy;
        this._oldHp = hp[0];
        this._oldEnergy = energy[0];

        const bottomCenter = Camera.Transform.Scale[1] * -0.5;
        this.Transform.SetTransformParams([0, bottomCenter], null, [scale, scale], -10);

        const weaponFrame = new DrawDirectiveStaticImage(this, "weapon_frame");
        AlignmentUtility.BottomMiddle(weaponFrame);

        this._weaponIcon = new DrawDirectiveAnimatedImage(this, "weapon_icons");
        AlignmentUtility.Center(this._weaponIcon);
        this._weaponIcon.DrawOffset = weaponIconOffset;
        this._weaponIcon.Frame = iconDict[this._player.WeaponState];
        this._weaponIcon.DepthOffset = 1;

        const hp_dd_root = new DrawDirectiveAnimatedImage(this, 'health_bar_root');
        AlignmentUtility.BottomLeft(hp_dd_root);
        hp_dd_root.DrawOffset = barOffset;
        hp_dd_root.Frame = "full";

        const energy_dd_root = new DrawDirectiveAnimatedImage(this, 'energy_bar_root');
        AlignmentUtility.BottomRight(energy_dd_root);
        energy_dd_root.DrawOffset = [-barOffset[0], barOffset[1]];
        energy_dd_root.Frame = "full";

        let i = 0;
        const addTimer = new TimerComponent(this, barAddDelay, true);
        addTimer.OnTimesUpCallback = () => {
            let stop = true;

            const hp = this._player.Health;
            if (i < hp[1]) {
                const dd = new DrawDirectiveAnimatedImage(this, 'health_bar');
                AlignmentUtility.BottomLeft(dd);
                dd.DrawOffset = [barOffset[0] + rootSpacing[0] + barSpacing[0] * i - barStartOffset[0], barOffset[1]];
                dd.Opacity = 0;
                dd.Frame = hp[0] <= i ? "empty" : "full";
                this._hp_dds.push(dd);

                stop = false;
            }

            const energy = this._player.Energy;
            if (i < energy[1]) {
                const dd = new DrawDirectiveAnimatedImage(this, 'energy_bar');
                AlignmentUtility.BottomRight(dd);
                dd.DrawOffset = [-barOffset[0] - rootSpacing[0] - barSpacing[0] * i + barStartOffset[0], barOffset[1]];
                dd.Opacity = 0;
                dd.Frame = energy[0] <= i ? "empty" : "full";
                this._energy_dds.push(dd);

                stop = false;
            }

            if (stop)
                this.RemoveComponent(addTimer);
            else
                i++;
        }
        addTimer.Start();

    }

    private InitializationAnimation(dt: number) {
        let done = this._hp_dds.length > 0;

        for (let i = 0; i < this._hp_dds.length; i++) {
            const dd = this._hp_dds[i];

            if (dd.Opacity < 1) {
                dd.Opacity += fadeInSpeed * dt;
                done = false;
            }

            const offset = dd.DrawOffset;
            const endPosX = barOffset[0] + rootSpacing[0] + barSpacing[0] * i;
            if (offset[0] < endPosX) {
                dd.DrawOffset = [
                    Math.min(offset[0] + barSpeed[0] * dt, endPosX),
                    offset[1]
                ];

                done = false;
            }
        }

        for (let i = 0; i < this._energy_dds.length; i++) {
            const dd = this._energy_dds[i];

            if (dd.Opacity < 1) {
                dd.Opacity += fadeInSpeed * dt;
                done = false;
            }

            const offset = dd.DrawOffset;
            const endPosX = -barOffset[0] - rootSpacing[0] - barSpacing[0] * i;
            if (offset[0] > endPosX) {
                dd.DrawOffset = [
                    Math.max(offset[0] - barSpeed[0] * dt, endPosX),
                    offset[1]
                ];

                done = false;
            }
        }

        if (done)
            this._initializing = false;
    }

    Update(dt: number): void {
        super.Update(dt);

        if (this._initializing)
            this.InitializationAnimation(dt);

        // Check if state changed. Change icon if it did.
        if (this._oldState != this._player.WeaponState) {
            this._weaponIcon.Frame = iconDict[this._player.WeaponState];
            this._oldState = this._player.WeaponState;
        }

        let position: Vec2;

        // Checking for health and energy changes through Update and not a callback as to prevent multiple redundant calls at once
        const hp = this._player.Health[0];
        if (hp != this._oldHp) {
            for (let i = 0; i < this._hp_dds.length; i++) {
                this._hp_dds[i].Frame = hp <= i ? "empty" : "full";

                if (i + 1 <= this._oldHp && i + 1 > hp) {
                    this._damageParticle.DrawOffset = [
                        barOffset[0] + rootSpacing[0] + barSpacing[0] * (i + 1) - barSpacing[0] * 0.5,
                        barOffset[1] + barSpacing[1] * 0.5
                    ];

                    this._damageParticle.Burst();
                }
            }
            this._oldHp = hp;
        }

        const energy = this._player.Energy[0];
        if (energy != this._oldEnergy) {
            position = position! || this.WorldRelativeTransform.Position;
            for (let i = 0; i < this._energy_dds.length; i++) {
                this._energy_dds[i].Frame = energy <= i ? "empty" : "full";

                if (i + 1 <= this._oldEnergy && i + 1 > energy) {
                    this._energyUseParticle.DrawOffset = [
                        -barOffset[0] - rootSpacing[0] - barSpacing[0] * (i + 1) + barSpacing[0] * 0.5,
                        barOffset[1] + barSpacing[1] * 0.5
                    ];

                    this._energyUseParticle.Burst();
                }
            }
            this._oldEnergy = energy;
        }
    }
}