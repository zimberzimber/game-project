import { HitboxBase } from "../../Components/Hitboxes/HitboxBase";
import { HitboxCircle } from "../../Components/Hitboxes/HitboxCircle";
import { ForceComponent } from "../../Components/Mechanics/ForceComponent";
import { DrawDirectiveImageBase } from "../../Components/Visual/DrawDirectiveImageBase";
import { DrawDirectiveStaticImage } from "../../Components/Visual/DrawDirectiveStaticImage";
import { CollisionGroup, TriggerState } from "../../Models/CollisionModels";
import { GlobalDataFields } from "../../Models/GlobalData";
import { AlignmentUtility } from "../../Utility/Alignment";
import { Vec2Utils } from "../../Utility/Vec2";
import { GlobalGameData } from "../../Workers/GlobalGameDataManager";
import { EntityBase, GameEntityBase } from "../EntityBase";

const cfg = {
    radius: 1,
    pullDelay: 0.5,
    pullAcceleration: 3000,
    rotationSpeed: 720,
    initialSpeed: 1500,
    initialSpeedFlatDecline: 1,
}

export abstract class CollectibleBaseEntity extends GameEntityBase {
    protected _touchHitbox: HitboxCircle;
    protected _pullHitbox: HitboxCircle;
    protected _dd: DrawDirectiveImageBase;

    protected _delayTime: number = cfg.pullDelay;
    protected _speed: number = cfg.initialSpeed;
    protected _pickupTarget: EntityBase | undefined;

    constructor() {
        super();
        this.Transform.Rotation = Math.random() * 360;
        this._touchHitbox = new HitboxCircle(this, cfg.radius);
        this._touchHitbox.CollideWithGroup = CollisionGroup.Player;
        this._touchHitbox.TriggerState = TriggerState.OnEnterTrigger;
    }

    Update(dt: number) {
        super.Update(dt);

        if (this._pickupTarget) {
            this._speed += cfg.pullAcceleration * dt;
            const targetPos = this._pickupTarget.WorldRelativeTransform.Position;
            const dist = Vec2Utils.Distance(this.Transform.Position, targetPos);

            this.Transform.RotateTowards(targetPos, cfg.rotationSpeed * dt);
            this.Transform.MoveForward(Math.min(dist, this._speed * dt));
        } else {
            if (this._speed > 0) {
                this.Transform.MoveForward(this._speed * dt);
                this._speed = this._speed - this._speed / 2 - cfg.initialSpeedFlatDecline * dt;
            } else if (this._delayTime > 0) {
                this._delayTime -= dt;
            } else {
                this._pickupTarget = GlobalGameData.GetValue(GlobalDataFields.PlayerEntity);
            }
        }
    }
}

export class ScoreCollectibleEntity extends CollectibleBaseEntity {
    constructor() {
        super();

        this._dd = new DrawDirectiveStaticImage(this, "ui_score", [16, 16]);
        AlignmentUtility.Center(this._dd);

        this._touchHitbox.CollisionScript = (trigerredBy: HitboxBase) => {
            GlobalGameData.SetValue(GlobalDataFields.Score, GlobalGameData.GetValue(GlobalDataFields.Score) + 10);
            this.Delete();
        }
    }
}

export class HealthCollectibleEntity extends CollectibleBaseEntity {
    constructor() {
        super();

        this._dd = new DrawDirectiveStaticImage(this, "pickup_health", [16, 16]);
        AlignmentUtility.Center(this._dd);

        this._touchHitbox.CollisionScript = (trigerredBy: HitboxBase) => {
            GlobalGameData.SetValue(GlobalDataFields.Health, GlobalGameData.GetValue(GlobalDataFields.Health) + 1);
            this.Delete();
        }
    }
}

export class EnergyCollectibleEntity extends CollectibleBaseEntity {
    constructor() {
        super();

        this._dd = new DrawDirectiveStaticImage(this, "pickup_energy", [16, 16]);
        AlignmentUtility.Center(this._dd);

        this._touchHitbox.CollisionScript = (trigerredBy: HitboxBase) => {
            GlobalGameData.SetValue(GlobalDataFields.Energy, GlobalGameData.GetValue(GlobalDataFields.Energy) + 1);
            this.Delete();
        }
    }
}