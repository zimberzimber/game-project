import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { Sprites } from "../../Workers/SpriteManager";
import { DrawDirectiveImageBase } from "./DrawDirectiveImageBase";

export class DrawDirectiveFullImage extends DrawDirectiveImageBase {
    private _imageId: number = 0;
    get ImageId(): number { return this._imageId; }

    private _translucent: boolean;
    get IsTranslucent(): boolean { return this._translucent; }

    constructor(parent: EntityBase, imageName: string, size?: number | Vec2) {
        super(parent, size);

        const spriteData = Sprites.GetFullImageAsSprite(imageName);
        this._imageId = spriteData.imageId;
        this.FrameData = spriteData.frame;
        this._translucent = spriteData.isTranslucent;
    }
}