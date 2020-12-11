import { HitboxBase } from "../../Components/Hitboxes/HitboxBase";
import { HitboxPolygon } from "../../Components/Hitboxes/HitboxPolygon";
import { DrawDirectiveAnimatedImage } from "../../Components/Visual/DrawDirectiveAnimatedImage";
import { GameEntityBase } from "../EntityBase";
import { GameplayInteractiveEntityBase } from "../GameplayInteractiveEntity";
import { TriggerState, CollisionGroup } from "../../Models/CollisionModels";
import { VerticalAlignment, HorizontalAlignment } from "../../Models/GenericInterfaces";
import { Vec2 } from "../../Models/Vectors";
import { IPolylineMutatorDictionary, TimedPolylineMutatorComponent } from "../../Components/Helpers/PolylineMutator";
import { ScalarUtil } from "../../Utility/Scalar";

export interface IPlayerWeaponDamageZoneConfig {
    sprite: string;
    damage: number;
    lifespan: number;
    shape: IPolylineMutatorDictionary;
    flippedShape: IPolylineMutatorDictionary;
}

export abstract class PlayerWeaponDamageZoneBaseEntity extends GameEntityBase {
    protected _lifespan = 0;

    constructor(parent: GameEntityBase, directionAngle: number, config: IPlayerWeaponDamageZoneConfig) {
        super(parent);
        this.Transform.Rotation = directionAngle;
        const flipped = ScalarUtil.IsAngleFacingLeft(directionAngle);

        const dd = new DrawDirectiveAnimatedImage(this, config.sprite);
        dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Left };
        dd.VerticalFlip = flipped;
        
        const hitboxMutator = new TimedPolylineMutatorComponent(this, flipped ? config.flippedShape : config.shape, config.lifespan / config.shape.length, false, false);
        
        const hitbox = new HitboxPolygon(this, hitboxMutator.Polyline);
        hitbox.TriggerState = TriggerState.OneTimeTrigger;
        hitbox.CollideWithGroup = CollisionGroup.Enemy;
        hitbox.CollisionScript = (trigerredBy: HitboxBase) => {
            if (trigerredBy.Parent instanceof GameplayInteractiveEntityBase)
                trigerredBy.Parent.Damage(config.damage);
        };

        hitboxMutator.OnMutated = (polyline: Vec2[], index: number) => {
            hitbox.Polyline = polyline;
            dd.Frame = index;
        }

        this._lifespan = config.lifespan;
    }

    Update(delta: number) {
        super.Update(delta);

        this._lifespan -= delta;
        if (this._lifespan <= 0) {
            this.Delete();
            return;
        }
    }
}
