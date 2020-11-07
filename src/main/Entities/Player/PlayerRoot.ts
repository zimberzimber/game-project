import { GameEntityBase } from "../EntityBase";
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { PlayerMovementComponent } from "../../Components/Mechanics/PlayerMovementComponent";
import { HitboxRectangle } from "../../Components/Hitboxes/HitboxRectangle";
import { CollisionGroup, HitboxType, TriggerState } from "../../Models/CollisionModels";
import { HitboxBase } from "../../Components/Hitboxes/HitboxBase";
import { LightComponent } from "../../Components/Visual/Light";
import { HorizontalAlignment, VerticalAlignment } from "../../Models/GenericInterfaces";
import { ButtonState, IMouseEvent, IMouseObserver, MouseButton } from "../../Models/InputModels";
import { Input } from "../../Workers/InputHandler";
import { ProjectileBasic } from "../Projectiles/ProjectileBase";
import { EnergyResourceComponent, HealthResourceComponent } from "../../Components/Mechanics/Resource";
import { ProjectilePlayerTest } from "../Projectiles/Player/Test";

const cfg = {
    postDamageInvlunTime: 1,
    fireColldown: 0.1,
    maxHp: 10,
    maxEnergy: 10,
}

export class OriEntity extends GameEntityBase {
    private dd: DrawDirectiveAnimatedImage;
    private light: LightComponent;
    // private particle: ParticleComponent;

    private frameDelta: number = 0.25;
    private frameTime: number = 0;
    private frame: number = 0;

    constructor(parent: GameEntityBase | void | null) {
        super(parent);
        this.dd = new DrawDirectiveAnimatedImage(this, "ori", [5, 15]);
        this.dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };

        this.light = new LightComponent(this, [0.85, 0.85, 1], 15, 0.05);
        // this.particle = new ParticleComponent(this, 'test');
        // this.particle.Start();
    }

    Update(delta: number) {
        super.Update(delta);

        this.frameTime += delta;
        if (this.frameTime >= this.frameDelta) {
            this.frameTime %= this.frameDelta;
            this.frame = (this.frame + 1) % 4;
            this.dd.Frame = this.frame.toString();
        }
    }
}

export class KuEntity extends GameEntityBase {
    private dd: DrawDirectiveAnimatedImage;

    private frameDelta: number = 0.1;
    private frameTime: number = 0;
    private frame: number = 0;

    constructor(parent: GameEntityBase | void | null) {
        super(parent);
        this.dd = new DrawDirectiveAnimatedImage(this, "ku", [18, 13]);
        this.dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
    }

    Update(delta: number) {
        super.Update(delta);

        this.frameTime += delta;
        if (this.frameTime >= this.frameDelta) {
            this.frameTime %= this.frameDelta;
            this.frame = (this.frame + 1) % 6;
            this.dd.Frame = this.frame.toString();
        }
    }
}

export class PlayerEntity extends GameEntityBase {
    private oriEntity: OriEntity;
    private kuEntity: KuEntity;
    private firing: boolean = false;
    private fireCooldown: number = cfg.fireColldown;
    private fireCooldownProgress: number = 0;

    private clickObserver: IMouseObserver;
    private hp: HealthResourceComponent;
    private energy: EnergyResourceComponent;

    protected _invulnTime = 0;
    get IsInvuln(): boolean { return this._invulnTime > 0; }

    get Health(): [number, number] { return [this.hp.Value, this.hp.MaxValue]; }
    get Energy(): [number, number] { return [this.energy.Value, this.energy.MaxValue]; }

    constructor(parent: GameEntityBase | void | null) {
        super(parent);
        this.Transform.Scale = [3, 3];

        this.hp = new HealthResourceComponent(this, cfg.maxHp);
        this.hp.DepletedCallback = () => this.OnDie();
        this.hp.ValueChangedCallback = (d: number) => { if (d < 0) this.OnDamaged(-d); };


        this.energy = new EnergyResourceComponent(this, cfg.maxEnergy);

        this.clickObserver = {
            OnObservableNotified: (args: IMouseEvent): void => {
                if (args.button == MouseButton.M1)
                    this.firing = args.state == ButtonState.Down;
            }
        }

        new PlayerMovementComponent(this);

        const hitbox = new HitboxRectangle(this, 5, 15);
        hitbox.CollisionGroup = CollisionGroup.Player;
        hitbox.CollideWithGroup = CollisionGroup.Hazard;
        hitbox.TriggerState = TriggerState.NotTrigger;

        hitbox.CollisionScript = (e: HitboxBase): void => {
            // e.Parent.transform.MoveTowards(this.transform.Position, -5);
        }

        this.oriEntity = new OriEntity(this);
        this.oriEntity.Transform.SetTransformParams([0, 5], null, null, -1);

        this.kuEntity = new KuEntity(this);

        Input.MouseObservable.Subscribe(this.clickObserver);
    }

    Update(delta: number): void {
        super.Update(delta);

        if (this._invulnTime > 0)
            this._invulnTime -= delta;

        if (this.firing) {
            if (this.fireCooldownProgress <= 0) {
                const p = new ProjectilePlayerTest();
                p.Transform.Position = this.Transform.Position;
                this.fireCooldownProgress = this.fireCooldown;
            }
        }
        if (this.fireCooldownProgress > 0)
            this.fireCooldownProgress -= delta;
    }

    Damage(damage: number): void {
        if (this.IsInvuln) return;
        this.hp.Value -= damage;
    }

    Die(): void {
        this.hp.Value = 0;
    }

    Delete(): void {
        Input.MouseObservable.Unsubscribe(this.clickObserver);
        super.Delete()
    }

    private OnDie(): void {

    }

    private OnDamaged(damage: number): void {
        this._invulnTime = cfg.postDamageInvlunTime;
    }
}