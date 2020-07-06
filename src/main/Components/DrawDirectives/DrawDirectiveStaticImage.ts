import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { Sprites } from "../../Workers/SpriteManager";
import { Vec2Utils } from "../../Utility/Vec2";
import { ISingleFrameSpriteStorage } from "../../Models/SpriteModels";
import { DrawDirectiveImageBase } from "./DrawDirectiveImageBase";
import { ITransformEventArgs } from "../../Models/Transform";

export class DrawDirectiveStaticImage extends DrawDirectiveImageBase {
    Size: Vec2;
    protected readonly _spriteData: ISingleFrameSpriteStorage;

    constructor(parent: EntityBase, spriteName: string, size: Vec2 = [0, 0]) {
        super(parent, size);
        this._spriteData = Sprites.GetStaticSpriteData(spriteName) || { imageId: 0, frame: { origin: [0, 0], size: [0, 0] } };
        this._webglData.indexes = [
            0, 1, 2,
            0, 2, 3
        ];
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        const trans = this._parent.worldRelativeTransform;
        const ox = this.Size[0] / 2 * trans.Scale[0];
        const oy = this.Size[1] / 2 * trans.Scale[1];
        const sd = this._spriteData;

        if (trans.RotationRadian != 0) {
            const p1 = Vec2Utils.RotatePointAroundCenter([trans.Position[0] + ox, trans.Position[1] + oy], trans.RotationRadian, trans.Position);
            const p2 = Vec2Utils.RotatePointAroundCenter([trans.Position[0] - ox, trans.Position[1] + oy], trans.RotationRadian, trans.Position);
            const p3 = Vec2Utils.RotatePointAroundCenter([trans.Position[0] - ox, trans.Position[1] - oy], trans.RotationRadian, trans.Position);
            const p4 = Vec2Utils.RotatePointAroundCenter([trans.Position[0] + ox, trans.Position[1] - oy], trans.RotationRadian, trans.Position);
            this._webglData.attributes = [
                p1[0], p1[1], trans.Depth, sd.frame.origin[0] + sd.frame.size[0], sd.frame.origin[1],
                p2[0], p2[1], trans.Depth, sd.frame.origin[0], sd.frame.origin[1],
                p3[0], p3[1], trans.Depth, sd.frame.origin[0], sd.frame.origin[1] + sd.frame.size[1],
                p4[0], p4[1], trans.Depth, sd.frame.origin[0] + sd.frame.size[0], sd.frame.origin[1] + sd.frame.size[1],
            ];
        } else {
            this._webglData.attributes = [
                trans.Position[0] + ox, trans.Position[1] + oy, trans.Depth, sd.frame.origin[0] + sd.frame.size[0], sd.frame.origin[1],
                trans.Position[0] - ox, trans.Position[1] + oy, trans.Depth, sd.frame.origin[0], sd.frame.origin[1],
                trans.Position[0] - ox, trans.Position[1] - oy, trans.Depth, sd.frame.origin[0], sd.frame.origin[1] + sd.frame.size[1],
                trans.Position[0] + ox, trans.Position[1] - oy, trans.Depth, sd.frame.origin[0] + sd.frame.size[0], sd.frame.origin[1] + sd.frame.size[1],
            ];
        }
    }
}