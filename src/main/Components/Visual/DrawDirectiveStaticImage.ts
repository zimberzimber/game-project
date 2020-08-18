import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { Sprites } from "../../Workers/SpriteManager";
import { ISingleFrameSpriteStorage } from "../../Models/SpriteModels";
import { DrawDirectiveImageBase } from "./DrawDirectiveImageBase";
import { Log } from "../../Workers/Logger";

export class DrawDirectiveStaticImage extends DrawDirectiveImageBase {
    protected readonly _spriteData: ISingleFrameSpriteStorage;

    private _imageId: number = 0;
    get ImageId(): number { return this._imageId; }

    private _translucent: boolean;
    get IsTranslucent(): boolean { return this._translucent; }

    constructor(parent: EntityBase, spriteName: string, size: Vec2 = [0, 0]) {
        super(parent, size);

        const spriteData = Sprites.GetStaticSpriteData(spriteName);
        if (spriteData) {
            this._imageId = spriteData.imageId;
            this._translucent = spriteData.isTranslucent || false;
            this.FrameData = spriteData.frame;
        }
        else
            Log.Warn(`Could not retrieve static sprite for DrawDirectiveStaticImage: ${spriteName}`);
    }
}