import { TimerComponent } from "../../../Components/Mechanics/TimerComponent";
import { DrawDirectiveAnimatedImage } from "../../../Components/Visual/DrawDirectiveAnimatedImage";
import { DrawDirectiveStaticImage } from "../../../Components/Visual/DrawDirectiveStaticImage";
import { DrawDirectiveText } from "../../../Components/Visual/DrawDirectiveText";
import { ParticleComponent } from "../../../Components/Visual/Particle";
import { GlobalDataFields, IGlobalGameDataEventArgs, IGlobalGameDataObserver } from "../../../Models/GlobalData";
import { HammerChargeState, HammerSwingState, MeleeRestState, SwordIdleState, SwordSlashState } from "../../../Models/PlayerWeaponStates/Melee";
import { RangedIdleState } from "../../../Models/PlayerWeaponStates/Ranged";
import { SpecialState } from "../../../Models/PlayerWeaponStates/Special";
import { Vec2 } from "../../../Models/Vectors";
import { AlignmentUtility } from "../../../Utility/Alignment";
import { Camera } from "../../../Workers/CameraManager";
import { Game } from "../../../Workers/Game";
import { GlobalGameData } from "../../../Workers/GlobalGameDataManager";
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
    private _player: PlayerEntity;
    private _oldState: string;
    private _initializing: boolean = true;

    private _hp_dds: DrawDirectiveAnimatedImage[] = [];
    private _energy_dds: DrawDirectiveAnimatedImage[] = [];
    private _weaponIcon: DrawDirectiveAnimatedImage;
    private _weaponFrame: DrawDirectiveAnimatedImage;
    private _scoreEntity:  ScoreBar;

    private _damageParticle: ParticleComponent;
    private _energyUseParticle: ParticleComponent;

    private _hpObserver: IGlobalGameDataObserver = {
        OnObservableNotified: (args: IGlobalGameDataEventArgs) => {
            const hp = args.newValue;
            const oldHp = args.oldValue;

            for (let i = 0; i < this._hp_dds.length; i++) {
                this._hp_dds[i].Frame = hp <= i ? "empty" : "full";

                if (i + 1 <= oldHp && i + 1 > hp) {
                    this._damageParticle.DrawOffset = [
                        barOffset[0] + rootSpacing[0] + barSpacing[0] * (i + 1) - barSpacing[0] * 0.5,
                        barOffset[1] + barSpacing[1] * 0.5
                    ];

                    this._damageParticle.Burst();
                }
            }
        }
    };

    private _energyObserver: IGlobalGameDataObserver = {
        OnObservableNotified: (args: IGlobalGameDataEventArgs) => {
            const energy = args.newValue;
            const oldEnergy = args.oldValue;

            for (let i = 0; i < this._energy_dds.length; i++) {
                this._energy_dds[i].Frame = energy <= i ? "empty" : "full";

                if (i + 1 <= oldEnergy && i + 1 > energy) {
                    this._energyUseParticle.DrawOffset = [
                        -barOffset[0] - rootSpacing[0] - barSpacing[0] * (i + 1) + barSpacing[0] * 0.5,
                        barOffset[1] + barSpacing[1] * 0.5
                    ];

                    this._energyUseParticle.Burst();
                }
            }
        }
    };

    private _playerObserver: IGlobalGameDataObserver = {
        OnObservableNotified: (args: IGlobalGameDataEventArgs) => {
            this._player = args.newValue;
        }
    }

    constructor() {
        super();

        GlobalGameData.Subscribe(GlobalDataFields.Health, this._hpObserver);
        GlobalGameData.Subscribe(GlobalDataFields.Energy, this._energyObserver);
        GlobalGameData.Subscribe(GlobalDataFields.PlayerEntity, this._playerObserver);

        this._damageParticle = new ParticleComponent(this, "health_shatter_splash");
        this._damageParticle.DepthOffset = 1;

        this._energyUseParticle = new ParticleComponent(this, "energy_shatter_splash");
        this._energyUseParticle.DepthOffset = 2;

        const bottomCenter = Camera.Transform.Scale[1] * -0.5;
        this.Transform.SetTransformParams([0, bottomCenter], null, [scale, scale], -10);

        this._weaponFrame = new DrawDirectiveAnimatedImage(this, "weapon_frame");
        this._weaponFrame.Frame = "default";
        AlignmentUtility.BottomMiddle(this._weaponFrame);

        this._weaponIcon = new DrawDirectiveAnimatedImage(this, "weapon_icons");
        AlignmentUtility.Center(this._weaponIcon);
        this._weaponIcon.DrawOffset = weaponIconOffset;
        this._weaponIcon.DepthOffset = 1;

        this._player = GlobalGameData.GetValue(GlobalDataFields.PlayerEntity);
        if (this._player)
            this._weaponIcon.Frame = iconDict[this._player.WeaponState];
        else
            this._weaponIcon.Frame = iconDict[SwordIdleState.name];

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

            const hp = GlobalGameData.GetValue(GlobalDataFields.Health);
            const MaxHp = GlobalGameData.GetValue(GlobalDataFields.MaxHealth);
            if (i < MaxHp) {
                const dd = new DrawDirectiveAnimatedImage(this, 'health_bar');
                AlignmentUtility.BottomLeft(dd);
                dd.DrawOffset = [barOffset[0] + rootSpacing[0] + barSpacing[0] * i - barStartOffset[0], barOffset[1]];
                dd.Opacity = 0;
                dd.Frame = hp <= i ? "empty" : "full";
                this._hp_dds.push(dd);

                stop = false;
            }

            const energy = GlobalGameData.GetValue(GlobalDataFields.Energy);
            const MaxEnergy = GlobalGameData.GetValue(GlobalDataFields.MaxEnergy);
            if (i < MaxEnergy) {
                const dd = new DrawDirectiveAnimatedImage(this, 'energy_bar');
                AlignmentUtility.BottomRight(dd);
                dd.DrawOffset = [-barOffset[0] - rootSpacing[0] - barSpacing[0] * i + barStartOffset[0], barOffset[1]];
                dd.Opacity = 0;
                dd.Frame = energy <= i ? "empty" : "full";
                this._energy_dds.push(dd);

                stop = false;
            }

            if (stop)
                this.RemoveComponent(addTimer);
            else
                i++;
        }
        addTimer.Start();


        new Score().Transform.Position = [0, 50];

        this._scoreEntity = new ScoreBar(this);
        this._scoreEntity.Transform.SetTransformParams([0, 12], null, null, 1);
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
        if (this._player) {
            if (this._oldState != this._player.WeaponState) {
                this._weaponIcon.Frame = iconDict[this._player.WeaponState];
                this._oldState = this._player.WeaponState;
            }

            this._weaponFrame.Frame = this._player.WeaponLocked ? "locked" : "default";
        }
    }

    Delete(): void {
        GlobalGameData.Unsubscribe(GlobalDataFields.Health, this._hpObserver);
        GlobalGameData.Unsubscribe(GlobalDataFields.Energy, this._energyObserver);
        GlobalGameData.Unsubscribe(GlobalDataFields.PlayerEntity, this._playerObserver);
        super.Delete();
    }
}

class Score extends UiEntityBase {
    private _dd: DrawDirectiveText;
    private _observer: IGlobalGameDataObserver = {
        OnObservableNotified: (args: IGlobalGameDataEventArgs): void => {
            this._dd.Text = args.newValue;
        }
    }

    constructor() {
        super();
        const score = GlobalGameData.GetValue(GlobalDataFields.Score).toString();
        this._dd = new DrawDirectiveText(this, 20, score);
        GlobalGameData.Subscribe(GlobalDataFields.Score, this._observer);
    }

    Delete() {
        GlobalGameData.Unsubscribe(GlobalDataFields.Score, this._observer);
        super.Delete();
    }
}

class ScoreBar extends UiEntityBase {
    private _fullDd: DrawDirectiveStaticImage;
    private _emptyDd: DrawDirectiveStaticImage;

    constructor(parent: UiEntityBase | void | null) {
        super(parent);

        this._emptyDd = new DrawDirectiveStaticImage(this, "ui_score_bar_empty");
        AlignmentUtility.BottomMiddle(this._emptyDd);

        this._fullDd = new DrawDirectiveStaticImage(this, "ui_score_bar_full");
        AlignmentUtility.BottomMiddle(this._fullDd);
        this._fullDd.DepthOffset = 1;
        this._fullDd.Cutoff = [0.5, 1];
    }

    SetPercentage(pcnt: number): void {
        this._fullDd.Cutoff = [pcnt, 1];
    }
}