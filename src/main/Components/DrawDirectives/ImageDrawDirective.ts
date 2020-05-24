import { DrawDirectiveBase } from "../../Bases/DrawDirectiveBase";
import { EntityBase } from "../../Bases/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { Sprites } from "../../Workers/SpriteManager";
import { ISPriteData } from "../../Models/SpriteModels";
import { Vec2Utils } from "../../Utility/Vec2";

export class ImageDrawDirective extends DrawDirectiveBase {
    size: Vec2;
    private readonly _spriteData: ISPriteData;

    constructor(parent: EntityBase, spriteName: string, size: Vec2 = [0, 0]) {
        super(parent);
        this.size = size;
        this._spriteData = Sprites.GetSprite(spriteName);
    }

    get SpriteData(): ISPriteData { return this._spriteData };

    get WebGlData(): number[] {
        const trans = this._parent.worldRelativeTransform;
        const ox = this.size[0] / 2 * trans.Scale[0];
        const oy = this.size[1] / 2 * trans.Scale[1];
        const sd = this._spriteData;

        if (trans.RotationRadian != 0) {
            const p1 = Vec2Utils.RotatePointAroundCenter([trans.Position[0] + ox, trans.Position[1] + oy], trans.RotationRadian, trans.Position);
            const p2 = Vec2Utils.RotatePointAroundCenter([trans.Position[0] - ox, trans.Position[1] + oy], trans.RotationRadian, trans.Position);
            const p3 = Vec2Utils.RotatePointAroundCenter([trans.Position[0] - ox, trans.Position[1] - oy], trans.RotationRadian, trans.Position);
            const p4 = Vec2Utils.RotatePointAroundCenter([trans.Position[0] + ox, trans.Position[1] - oy], trans.RotationRadian, trans.Position);
            return [
                p1[0], p1[1], trans.Depth, sd.origin[0] + sd.size[0], sd.origin[1],
                p2[0], p2[1], trans.Depth, sd.origin[0], sd.origin[1],
                p3[0], p3[1], trans.Depth, sd.origin[0], sd.origin[1] + sd.size[1],
                p4[0], p4[1], trans.Depth, sd.origin[0] + sd.size[0], sd.origin[1] + sd.size[1],
            ];

        } else {
            return [
                trans.Position[0] + ox, trans.Position[1] + oy, trans.Depth, sd.origin[0] + sd.size[0], sd.origin[1],
                trans.Position[0] - ox, trans.Position[1] + oy, trans.Depth, sd.origin[0], sd.origin[1],
                trans.Position[0] - ox, trans.Position[1] - oy, trans.Depth, sd.origin[0], sd.origin[1] + sd.size[1],
                trans.Position[0] + ox, trans.Position[1] - oy, trans.Depth, sd.origin[0] + sd.size[0], sd.origin[1] + sd.size[1],
            ];
        }

        // const rx = Math.cos(trans.RotationRadian);
        // const ry = Math.sin(trans.RotationRadian);

        // // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
        // return [
        //     trans.Position[0], trans.Position[1], trans.Depth, ox, oy, rx, ry, sd.origin[0] + sd.size[0], sd.origin[1],
        //     trans.Position[0], trans.Position[1], trans.Depth, -ox, oy, rx, ry, sd.origin[0], sd.origin[1],
        //     trans.Position[0], trans.Position[1], trans.Depth, -ox, -oy, rx, ry, sd.origin[0], sd.origin[1] + sd.size[1],
        //     trans.Position[0], trans.Position[1], trans.Depth, ox, -oy, rx, ry, sd.origin[0] + sd.size[0], sd.origin[1] + sd.size[1],
        // ];
    }
}


