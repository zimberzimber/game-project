import { GameEntityBase } from "../EntityBase";
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { PlayerMovementComponent } from "../../Components/Mechanics/PlayerMovementComponent";
import { CollisionGroup, HitboxType, TriggerState } from "../../Models/CollisionModels";
import { HitboxBase } from "../../Components/Hitboxes/HitboxBase";
import { LightComponent } from "../../Components/Visual/Light";
import { HorizontalAlignment, VerticalAlignment } from "../../Models/GenericInterfaces";
import { GameplayInteractiveEntityBase } from "../GameplayInteractiveEntity";
import { Vec2, Vec3 } from "../../Models/Vectors";
import { SimpleAnimatorComponent } from "../../Components/Mechanics/TimerComponent";
import { PlayerWeaponHandlerComponent } from "../../Components/Mechanics/PlayerWeaponHandler";
import { EnergyResourceComponent } from "../../Components/Mechanics/Resource";

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

export class PlayerEntity extends GameplayInteractiveEntityBase {
    private _kuDd: DrawDirectiveAnimatedImage;
    private _kuDdAnimation: SimpleAnimatorComponent;
    private _oriEntity: OriEntity;

    private energy: EnergyResourceComponent;
    get Energy(): [number, number] { return [this.energy.Value, this.energy.MaxValue]; }

    private _invulnTime = 0;
    get IsInvuln(): boolean { return this._invulnTime > 0; }

    constructor() {
        super(null, cfg.maxHp, cfg.hitboxType, cfg.hitboxSize, CollisionGroup.Player, CollisionGroup.None, TriggerState.NotTrigger);
        this.energy = new EnergyResourceComponent(this, 5, 2);

        this._kuDd = new DrawDirectiveAnimatedImage(this, "ku", cfg.ku_size);
        this._kuDd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        this._kuDdAnimation = new SimpleAnimatorComponent(this, cfg.ku_frameDelta, true, this._kuDd, cfg.ku_frames);
        this._kuDdAnimation.Start();

        new PlayerMovementComponent(this);

        this.hitbox.CollisionScript = (e: HitboxBase): void => {
            // e.Parent.transform.MoveTowards(this.transform.Position, -5);
        }

        this._oriEntity = new OriEntity(this);
        this._oriEntity.Transform.SetTransformParams(cfg.ori_offset, null, null, -1);
    }

    Update(delta: number): void {
        super.Update(delta);

        if (this._invulnTime > 0)
            this._invulnTime -= delta;
    }

    Damage(damage: number): void {
        if (this.IsInvuln) return;
        super.Damage(damage);
    }

    protected OnDied(): void {
        console.log("ded");
        this._kuDdAnimation.Stop();
    }

    protected OnDamaged(damage: number): void {
        this._invulnTime = cfg.postDamageInvlunTime;
        super.OnDamaged(damage);
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
        new PlayerWeaponHandlerComponent(this, cfg.weapon_offset);
    }
}