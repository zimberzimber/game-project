import { DrawDirectiveBase } from "../../Bases/DrawDirectiveBase";
import { EntityBase } from "../../Bases/EntityBase";
import { Vec2 } from "../../Models/Vec2";
import { Sprites } from "../../Workers/SpriteManager";
import { ISPriteData } from "../../Models/SpriteModels";

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

        const rx = Math.cos(trans.RotationRadian);
        const ry = Math.sin(trans.RotationRadian);

        const sd = this._spriteData;

        // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
        return [
            trans.Position[0], trans.Position[1], trans.Depth, ox, oy, rx, ry, sd.origin[0] + sd.size[0], sd.origin[1],
            trans.Position[0], trans.Position[1], trans.Depth, -ox, oy, rx, ry, sd.origin[0], sd.origin[1],
            trans.Position[0], trans.Position[1], trans.Depth, -ox, -oy, rx, ry, sd.origin[0], sd.origin[1] + sd.size[1],
            trans.Position[0], trans.Position[1], trans.Depth, ox, -oy, rx, ry, sd.origin[0] + sd.size[0], sd.origin[1] + sd.size[1],
        ];
    }
}


