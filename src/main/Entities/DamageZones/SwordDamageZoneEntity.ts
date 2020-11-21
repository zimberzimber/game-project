import { HitboxBase } from "../../Components/Hitboxes/HitboxBase";
import { HitboxPolygon } from "../../Components/Hitboxes/HitboxPolygon";
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { GameEntityBase } from "../EntityBase";
import { GameplayInteractiveEntityBase } from "../GameplayInteractiveEntity";
import { TriggerState, CollisionGroup } from "../../Models/CollisionModels";
import { VerticalAlignment, HorizontalAlignment } from "../../Models/GenericInterfaces";
import { Vec2 } from "../../Models/Vectors";
import { IPolylineMutatorDictionary, TimedPolylineMutatorComponent } from "../../Components/Helpers/PolylineMutator";

const damage = 4;
const damageDuration = 0.1;
const shape: IPolylineMutatorDictionary = [
    [[-40, 0], [20, -40], [80, -50], [100, -20]],
    [[-40, 0], [20, -40], [80, -50], [100, -20], [100, 20]],
    [[-40, 0], [100, -20], [100, 20], [80, 50], [20, 40]],
    [[-40, 0], [20, 40], [80, 50], [100, 20]]
]
const flipperShape: IPolylineMutatorDictionary = [shape[3], shape[2], shape[1], shape[0]];

export class SwordDamageZoneEntity extends GameEntityBase {
    private _duration = 0;
    private _hitbox: HitboxPolygon;
    private _dd: DrawDirectiveAnimatedImage;
    private _hitboxMutator: TimedPolylineMutatorComponent;

    constructor(directionAngle: number) {
        super();
        this.Transform.Rotation = directionAngle;
        const flipped = (directionAngle > 90 && directionAngle < 180) || (directionAngle < -90 && directionAngle > -180) ? true : false;

        this._dd = new DrawDirectiveAnimatedImage(this, "ori_sword_swing");
        this._dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Left };
        this._dd.Frame = 0;
        this._dd.VerticalFlip = flipped;

        this._hitboxMutator = new TimedPolylineMutatorComponent(this, flipped ? flipperShape : shape, damageDuration / 4, false, false);
        this._hitboxMutator.OnMutated = (polyline: Vec2[], index: number) => {
            this._hitbox.Polyline = polyline;
            this._dd.Frame = index;
        }

        this._hitbox = new HitboxPolygon(this, this._hitboxMutator.Polyline);
        this._hitbox.TriggerState = TriggerState.OneTimeTrigger;
        this._hitbox.CollideWithGroup = CollisionGroup.Enemy;

        this._hitbox.CollisionScript = (trigerredBy: HitboxBase) => {
            if (trigerredBy.Parent instanceof GameplayInteractiveEntityBase)
                trigerredBy.Parent.Damage(damage);
        };
    }

    Update(delta: number) {
        super.Update(delta);

        this._duration += delta;
        if (this._duration >= damageDuration) {
            this.Delete();
            return;
        }
    }
}
