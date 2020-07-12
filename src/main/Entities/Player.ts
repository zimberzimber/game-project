import { GameEntityBase } from "./EntityBase";
import { PlayerMovementComponent } from "../Components/PlayerMovementComponent";
import { TriggerState, CollisionGroup } from "../Models/CollisionModels";
import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { DrawDirectiveAnimatedImage } from "../Components/DrawDirectives/DrawDirectiveAnimatedImage";
import { Light } from "../Components/Light/Light";
import { Vec2 } from "../Models/Vectors";
import { HitboxRectangle } from "../Components/Hitboxes/HitboxRectangle";

export class PlayerEntity extends GameEntityBase {
    oriEntity: GameEntityBase;

    oriDD: DrawDirectiveAnimatedImage;
    kuDD: DrawDirectiveAnimatedImage;
    constructor(parent: GameEntityBase | void | null) {
        super(parent);
        this.transform.Depth = -50;
        this.transform.Scale = [3, 3];

        this.AddComponent(new PlayerMovementComponent(this));

        this.oriEntity = new GameEntityBase(this)
        this.AddChildEntity(this.oriEntity);

        this.kuDD = new DrawDirectiveAnimatedImage(this, "ku", [18, 13]);
        this.oriDD = new DrawDirectiveAnimatedImage(this.oriEntity, "ori", [5, 15]);
        this.AddComponent(this.kuDD);
        this.oriEntity.AddComponent(this.oriDD);

        const hitbox = new HitboxRectangle(this, 5, 15);
        hitbox.CollisionGroup = CollisionGroup.Player;
        hitbox.CollideWithGroup = CollisionGroup.Hazard;
        hitbox.TriggerState = TriggerState.NotTrigger;

        hitbox.CollisionScript = (e: HitboxBase): void => {
            // e.Parent.transform.MoveTowards(this.transform.Position, -5);
        }
        this.AddComponent(hitbox);
        this.AddComponent(new Light(this, [0.85, 0.85, 1], 50, 0.25));
    }

    oriFrameDelta: number = 0.25;
    oriFrameTime: number = 0;
    oriFrame: number = 0;

    kuFrameDelta: number = 0.1;
    kuFrameTime: number = 0;
    kuFrame: number = 0;

    Update(delta: number) {
        super.Update(delta);

        this.oriFrameTime += delta;
        if (this.oriFrameTime >= this.oriFrameDelta) {
            this.oriFrameTime %= this.oriFrameDelta;
            this.oriFrame = (this.oriFrame + 1) % 4;
            this.oriDD.Frame = this.oriFrame.toString();
        }

        this.kuFrameTime += delta;
        if (this.kuFrameTime >= this.kuFrameDelta) {
            this.kuFrameTime %= this.kuFrameDelta;
            this.kuFrame = (this.kuFrame + 1) % 6;
            this.kuDD.Frame = this.kuFrame.toString();
        }
        // this.transform.Rotate(1);
        // Camera.Transform.Rotate(1);
        // this.transform.Rotate(0.5);
        // this.transform.position = Vec2Utils.Transform(this.transform.position, ScalarUtil.Shake() * 0.5, ScalarUtil.Shake() * 0.5);
    }
}