import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { Sprites } from "../../Workers/SpriteManager";
import { DrawDirectiveImageBase } from "./DrawDirectiveImageBase";
import { Vec2Utils } from "../../Utility/Vec2";

export class DrawDirectiveFullImage extends DrawDirectiveImageBase {
    private _imageId: number = 0;
    get ImageId(): number { return this._imageId; }

    constructor(parent: EntityBase, imageName: string, size: Vec2) {
        super(parent, size);

        const spriteData = Sprites.GetFullImageAsSprite(imageName);
        this._imageId = spriteData.imageId;
        this.FrameData = spriteData.frame;
    }
}