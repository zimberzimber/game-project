import { HitboxBase } from "../../Components/Hitboxes/HitboxBase";
import { HitboxCircle } from "../../Components/Hitboxes/HitboxCircle";
import { HitboxPolygon } from "../../Components/Hitboxes/HitboxPolygon";
import { HitboxRectangle } from "../../Components/Hitboxes/HitboxRectangle";
import { HealthResourceComponent } from "../../Components/Mechanics/Resource";
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { DrawDirectiveStaticImage } from "../../Components/Visual/DrawDirectiveStaticImage";
import { LightComponent } from "../../Components/Visual/Light";
import { ParticleComponent } from "../../Components/Visual/Particle";
import { CollisionGroup, HitboxType, TriggerState } from "../../Models/CollisionModels";
import { VerticalAlignment, HorizontalAlignment } from "../../Models/GenericInterfaces";
import { IsVec2, Vec2 } from "../../Models/Vectors";
import { Log } from "../../Workers/Logger";
import { GameEntityBase } from "../EntityBase";

export class EnemyBaseEntity extends GameEntityBase {
    protected hitbox: HitboxBase;
    protected hp: HealthResourceComponent;

    constructor(parent: GameEntityBase | void | null, health: number, hitboxType: HitboxType, hitboxSize: number | Vec2 | Vec2[]) {
        super(parent);

        let failMessage: undefined | string;

        switch (hitboxType) {
            case HitboxType.Circular:
                if (typeof hitboxSize == 'number')
                    this.hitbox = new HitboxCircle(this, hitboxSize);
                else
                    failMessage = `Bad hitbox size for initialized enemy entity: ${hitboxSize}, expected radius number`;
                break;

            case HitboxType.Rectangular:
                if (IsVec2(hitboxSize))
                    this.hitbox = new HitboxRectangle(this, hitboxSize[0], hitboxSize[1]);
                else
                    failMessage = `Bad hitbox size for initialized enemy entity: ${hitboxSize}, expected Vec2 for width and height`;
                break;

            case HitboxType.Polygonal:
                // First check if size not number, then if size[0][0] is number. ([0] of a number = undefined, which would be the case for Vec2)
                if (typeof hitboxSize != 'number' && hitboxSize[0][0] !== undefined)
                    this.hitbox = new HitboxPolygon(this, ...(hitboxSize as Vec2[]));
                else
                    failMessage = `Bad hitbox size for initialized enemy entity: ${hitboxSize}, expected array of Vec2`;
                break;

            default:
                failMessage = `Bad hitbox type for initialized enemy entity: ${hitboxType} -> ${HitboxType[hitboxType]}`;
        }

        if (failMessage) {
            Log.Error(failMessage);
            this.Enabled = false;
            return;
        }

        this.hitbox.CollisionGroup = CollisionGroup.Enemy;
        this.hitbox.CollideWithGroup = CollisionGroup.Player;
        this.hitbox.TriggerState = TriggerState.OnEnterTrigger;
        this.hitbox.CollisionScript = (h) => {
            const hp = h.Parent.GetComponentsOfType(HealthResourceComponent);
            if (hp[0]) hp[0].Value--;
        }

        this.hp = new HealthResourceComponent(this, health, health);
        this.hp.DepletedCallback = () => this.OnDied()
        this.hp.ValueChangedCallback = (delta) => {
            if (delta < 0)
                this.OnDamaged(delta * -1);
        }
    }

    Update(delta: number) {
        super.Update(delta);
    }

    Die(): void {
        this.hp.Value = 0;
    }

    protected OnDamaged(damage: number): void { }
    protected OnDied(): void {
        this.Delete();
    }
}