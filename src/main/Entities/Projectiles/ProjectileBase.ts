import { HitboxBase } from "../../Components/Hitboxes/HitboxBase";
import { HitboxRectangle } from "../../Components/Hitboxes/HitboxRectangle";
import { BasicMovementComponent } from "../../Components/Mechanics/BasicMovementComponent";
import { HealthResourceComponent } from "../../Components/Mechanics/Resource";
import { DrawDirectiveStaticImage } from "../../Components/Visual/DrawDirectiveStaticImage";
import { CollisionGroup, TriggerState } from "../../Models/CollisionModels";
import { HorizontalAlignment, VerticalAlignment } from "../../Models/GenericInterfaces";
import { GameEntityBase } from "../EntityBase";

export class ProjectileBasic extends GameEntityBase {
    protected _movement: BasicMovementComponent;
    protected _dd: DrawDirectiveStaticImage;
    protected _collider: HitboxRectangle;
    protected _timeToLive: number = 10;

    get Speed(): number { return this._movement.Speed; }
    set Speed(speed: number) { this._movement.Speed = speed; }

    constructor() {
        super();
        this._movement = new BasicMovementComponent(this, 10, 0);
        this._dd = new DrawDirectiveStaticImage(this, 'spike_big', [20, 10]);
        this._dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        this._collider = new HitboxRectangle(this, 20, 10);
        this._collider.CollideWithGroup = CollisionGroup.Enemy;
        this._collider.TriggerState = TriggerState.OneTimeTrigger;
        this._collider.CollisionScript = (trigger: HitboxBase) => {
            const hp = trigger.Parent.GetComponentsOfType(HealthResourceComponent, true)[0];
            if (hp) hp.Value--;
            this.Delete();
        }
    }

    Update(delta: number): void {
        super.Update(delta);

        this._timeToLive -= delta;
        if (this._timeToLive <= 0)
            this.Delete();
    }
}