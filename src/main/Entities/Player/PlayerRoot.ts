import { GameEntityBase } from "../EntityBase";
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { PlayerMovementComponent } from "../../Components/Mechanics/PlayerMovementComponent";
import { CollisionGroup, HitboxType, TriggerState } from "../../Models/CollisionModels";
import { HitboxBase } from "../../Components/Hitboxes/HitboxBase";
import { LightComponent } from "../../Components/Visual/Light";
import { HorizontalAlignment, IDamagable, VerticalAlignment } from "../../Models/GenericInterfaces";
import { GameplayInteractiveEntityBase } from "../GameplayInteractiveEntity";
import { Vec2, Vec3 } from "../../Models/Vectors";
import { SimpleAnimatorComponent } from "../../Components/Mechanics/TimerComponent";
import { PlayerWeaponHandlerComponent } from "../../Components/Mechanics/PlayerWeaponHandler";
import { EnergyResourceComponent, HealthResourceComponent } from "../../Components/Mechanics/Resource";
import { GlobalDataFields, IGlobalGameDataEventArgs, IGlobalGameDataObserver } from "../../Models/GlobalData";
import { HitboxPolygon } from "../../Components/Hitboxes/HitboxPolygon";
import { HitboxRectangle } from "../../Components/Hitboxes/HitboxRectangle";
import { GlobalGameData } from "../../Workers/GlobalGameDataManager";

const cfg = {
    postDamageInvlunTime: 1,
    fireColldown: 0.1,
    maxHp: 7,
    hitboxType: HitboxType.Rectangular,
    hitboxSize: [15, 45] as Vec2,

    ku_size: 3,
    ku_frameDelta: 0.1,
    ku_frames: 6,

    ori_size: 3,
    ori_offset: [0, 0] as Vec2,
    ori_lightColor: [0.85, 0.85, 0.85] as Vec3,
    ori_lightRadius: 15,
    ori_lightHardness: 0.15,
    ori_frameDelta: 0.25,
    ori_frames: 4,

    weapon_offset: [0, 30] as Vec2,
}

//  Root: Ku DD + Ori legs DD + hitbox + movement + resources
//      Ori body DD + Ori light + Ori particles
//          Ori arms + weapon controller

export class PlayerEntity extends GameEntityBase implements IDamagable {
    protected _hitbox: HitboxBase;
    protected _healthObserver: IGlobalGameDataObserver;

    private _kuDd: DrawDirectiveAnimatedImage;
    private _kuDdAnimation: SimpleAnimatorComponent;
    private _oriEntity: OriEntity;
    private _weaponHandler: PlayerWeaponHandlerComponent;

    private _invulnTime = 0;
    get IsInvuln(): boolean { return this._invulnTime > 0; }

    get WeaponState() { return this._weaponHandler.CurrentState; }
    get WeaponLocked() { return this._weaponHandler.WeaponLocked; }

    constructor() {
        super();

        this._hitbox = new HitboxRectangle(this, cfg.hitboxSize[0], cfg.hitboxSize[1]);
        this._hitbox.CollisionGroup = CollisionGroup.Player;
        this._hitbox.CollisionScript = (e: HitboxBase): void => {
            // e.Parent.transform.MoveTowards(this.transform.Position, -5);
        }

        this._kuDd = new DrawDirectiveAnimatedImage(this, "ku", cfg.ku_size);
        this._kuDd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        this._kuDdAnimation = new SimpleAnimatorComponent(this, cfg.ku_frameDelta, true, this._kuDd, cfg.ku_frames);
        this._kuDdAnimation.Start();

        new PlayerMovementComponent(this);

        this._oriEntity = new OriEntity(this);
        this._oriEntity.Transform.SetTransformParams(cfg.ori_offset, null, null, -1);

        this._weaponHandler = new PlayerWeaponHandlerComponent(this, cfg.weapon_offset);

        this._healthObserver = {
            OnObservableNotified: (args: IGlobalGameDataEventArgs) => {
                if (args.newValue < args.oldValue)
                    this.OnDamaged(args.oldValue - args.newValue);
            }
        }
        GlobalGameData.Subscribe(GlobalDataFields.Health, this._healthObserver);
        GlobalGameData.SetValue(GlobalDataFields.PlayerEntity, this);
    }

    get Health(): [number, number] {
        return [GlobalGameData.GetValue(GlobalDataFields.Health), GlobalGameData.GetValue(GlobalDataFields.MaxHealth)]
    }

    Die(): void {
        GlobalGameData.SetValue(GlobalDataFields.Health, 0);
    }

    Update(delta: number): void {
        super.Update(delta);

        if (this._invulnTime > 0)
            this._invulnTime -= delta;
    }

    Damage(damage: number): void {
        if (this.IsInvuln) return;
        this._invulnTime = cfg.postDamageInvlunTime;
        GlobalGameData.SetValue(GlobalDataFields.Health, GlobalGameData.GetValue(GlobalDataFields.Health) - damage);
    }

    protected OnDied(): void {
        console.log("ded");
        this._kuDdAnimation.Stop();
    }

    protected OnDamaged(damage: number): void {
        const hp = GlobalGameData.GetValue(GlobalDataFields.Health);
        if (damage >= hp) {
            this.OnDied();
        }
    }

    Delete(): void {
        GlobalGameData.Unsubscribe(GlobalDataFields.Health, this._healthObserver);

        if (GlobalGameData.GetValue(GlobalDataFields.PlayerEntity) == this)
            GlobalGameData.SetValue(GlobalDataFields.PlayerEntity, undefined);

        super.Delete();
    }
}

class OriEntity extends GameEntityBase {
    private _dd: DrawDirectiveAnimatedImage;
    private _animator: SimpleAnimatorComponent;

    constructor(parent: GameEntityBase | void | null) {
        super(parent);
        this._dd = new DrawDirectiveAnimatedImage(this, "ori", cfg.ori_size);
        this._dd.Alignment = { vertical: VerticalAlignment.Bottom, horizontal: HorizontalAlignment.Middle };

        this._animator = new SimpleAnimatorComponent(this, cfg.ori_frameDelta, true, this._dd, cfg.ori_frames);
        this._animator.Start();

        new LightComponent(this, cfg.ori_lightColor, cfg.ori_lightRadius, cfg.ori_lightHardness);
    }
}