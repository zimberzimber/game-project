import { GameEntityBase } from "../EntityBase";
import { DrawDirectiveAnimatedImage } from "../../Components/DrawDirectives/DrawDirectiveAnimatedImage";
import { Vec2 } from "../../Models/Vectors";
import { PlayerMovementComponent } from "../../Components/PlayerMovementComponent";
import { HitboxRectangle } from "../../Components/Hitboxes/HitboxRectangle";
import { CollisionGroup, TriggerState } from "../../Models/CollisionModels";
import { HitboxBase } from "../../Components/Hitboxes/HitboxBase";
import { Light } from "../../Components/Light/Light";

export class OriEntity extends GameEntityBase {
    private dd: DrawDirectiveAnimatedImage;
    private light: Light;

    private frameDelta: number = 0.25;
    private frameTime: number = 0;
    private frame: number = 0;

    constructor(parent: GameEntityBase | void | null) {
        super(parent);
        this.dd = new DrawDirectiveAnimatedImage(this, "ori", [5, 15]);
        this.AddComponent(this.dd);

        this.light = new Light(this, [0.85, 0.85, 1], 50, 0.25)
        this.AddComponent(this.light);
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
        this.AddComponent(this.dd);
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

export class PlayerEntity2 extends GameEntityBase {
    private oriEntity: OriEntity;
    private kuEntity: KuEntity;

    constructor(parent: GameEntityBase | void | null) {
        super(parent);
        this.transform.Depth = -50;
        this.transform.Scale = [3, 3];

        this.AddComponent(new PlayerMovementComponent(this));

        const hitbox = new HitboxRectangle(this, 5, 15);
        hitbox.CollisionGroup = CollisionGroup.Player;
        hitbox.CollideWithGroup = CollisionGroup.Hazard;
        hitbox.TriggerState = TriggerState.NotTrigger;

        hitbox.CollisionScript = (e: HitboxBase): void => {
            // e.Parent.transform.MoveTowards(this.transform.Position, -5);
        }
        this.AddComponent(hitbox);

        this.oriEntity = new OriEntity(this);
        this.oriEntity.transform.SetTransformParams([0, 5], null, null, -1);
        this.AddChildEntity(this.oriEntity);

        this.kuEntity = new KuEntity(this);
        this.AddChildEntity(this.kuEntity);
    }

    Update(delta: number) {
        super.Update(delta);

        // this.transform.Rotate(1);
        // Camera.Transform.Rotate(1);
        // this.transform.Rotate(0.5);
        // this.transform.position = Vec2Utils.Transform(this.transform.position, ScalarUtil.Shake() * 0.5, ScalarUtil.Shake() * 0.5);
    }
}