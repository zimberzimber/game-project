import { GameEntityBase } from "../EntityBase";
import { IPolylineMutatorDictionary } from "../../Components/Helpers/PolylineMutator";
import { PlayerWeaponDamageZoneBaseEntity } from "./PlayerWeaponDamageZoneBase";
import { ScalarUtil } from "../../Utility/Scalar";

const shape: IPolylineMutatorDictionary = [
    [[-10, 0], [-100, -100], [-30, -120]], // 1
    [[-10, 0], [-100, -100], [-30, -120], [100, -120],], // 1 + 2
    [[-10, 0], [-30, -120], [100, -120], [120, 0]], // 2 + 3
    [[-10, 0], [100, -120], [120, 0], [100, 120]], // 3 + 4
    [[-10, 0], [120, 0], [100, 120], [-30, 120]], // 4 + 5
    [[-10, 0], [100, 120], [-30, 120], [-100, 100]], // 5 + 6
    [[-10, 0], [-30, 120], [-100, 100]], // 6
]

const config = {
    baseDamage: 4,
    lifespan: 7,
    shape,
    flippedShape: shape.slice().reverse(),
    sprite: "ori_hammer_swing"
};

export class HammerDamageZoneEntity extends PlayerWeaponDamageZoneBaseEntity {
    constructor(parent: GameEntityBase, directionAngle: number, powerMultiplier: number) {
        if (ScalarUtil.IsAngleFacingLeft(directionAngle))
            directionAngle = 180;
        else
            directionAngle = 0;

        super(parent, directionAngle, {
            damage: config.baseDamage * powerMultiplier,
            ...config
        });

        this.Transform.Scale = [powerMultiplier, powerMultiplier];
    }
}
