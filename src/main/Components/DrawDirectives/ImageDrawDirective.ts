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

    get WebGlData(): number[] {
        const absTransform = this._parent.worldRelativeTransform;

        const ox = this.size[0] / 2 * absTransform.Scale[0];
        const oy = this.size[1] / 2 * absTransform.Scale[1];

        const rx = Math.sin(absTransform.RotationRadian);
        const ry = Math.cos(absTransform.RotationRadian);

        const sd = this._spriteData;

        // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
        return [
            absTransform.Position[0], absTransform.Position[1], 0, ox, oy, rx, ry, sd.origin[0] + sd.size[0], sd.origin[1],
            absTransform.Position[0], absTransform.Position[1], 0, -ox, oy, rx, ry, sd.origin[0], sd.origin[1],
            absTransform.Position[0], absTransform.Position[1], 0, -ox, -oy, rx, ry, sd.origin[0], sd.origin[1] + sd.size[1],
            absTransform.Position[0], absTransform.Position[1], 0, ox, -oy, rx, ry, sd.origin[0] + sd.size[0], sd.origin[1] + sd.size[1],
        ];
    }
}