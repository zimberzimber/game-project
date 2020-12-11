import { GameEntityBase } from "../EntityBase";
import { IPolylineMutatorDictionary } from "../../Components/Helpers/PolylineMutator";
import { IPlayerWeaponDamageZoneConfig, PlayerWeaponDamageZoneBaseEntity } from "./PlayerWeaponDamageZoneBase";
import { ScalarUtil } from "../../Utility/Scalar";

const damage = 4;
const damageDuration = 0.1;
const shape: IPolylineMutatorDictionary = [
    [[-40, 0], [20, -40], [80, -50], [100, -20]],
    [[-40, 0], [20, -40], [80, -50], [100, -20], [100, 20]],
    [[-40, 0], [100, -20], [100, 20], [80, 50], [20, 40]],
    [[-40, 0], [20, 40], [80, 50], [100, 20]]
]
const config: IPlayerWeaponDamageZoneConfig = {
    damage: 4,
    lifespan: 0.1,
    shape,
    flippedShape: shape.slice().reverse(),
    sprite: "ori_sword_swing"
};

export class SwordDamageZoneEntity extends PlayerWeaponDamageZoneBaseEntity {
    constructor(parent: GameEntityBase, directionAngle: number) {
        if (ScalarUtil.IsAngleFacingLeft(directionAngle))
            directionAngle = 180;
        else
            directionAngle = 0;

        super(parent, directionAngle, config);
    }
}
