import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { Sprites } from "../../Workers/SpriteManager";
import { IMultiFrameSpriteStorage, GetFrameFromMultiFrameStorage } from "../../Models/SpriteModels";
import { DrawDirectiveImageBase } from "./DrawDirectiveImageBase";
import { Log } from "../../Workers/Logger";

export class DrawDirectiveAnimatedImage extends DrawDirectiveImageBase {
    protected readonly _spriteData: IMultiFrameSpriteStorage;
    private _currentFrame: number = 0;

    get ImageId(): number { return this._spriteData.imageId; }
    get IsTranslucent(): boolean { return this._spriteData.isTranslucent; }

    constructor(parent: EntityBase, spriteName: string, size?: number | Vec2) {
        super(parent, size);

        const spriteData = Sprites.GetAnimatedSpriteData(spriteName);
        if (spriteData)
            this._spriteData = spriteData;
        else {
            this._spriteData = { imageId: 0, frames: [], isTranslucent: false };
            Log.Warn(`Could not retrieve animated sprite for DrawDirectiveAnimatedImage: ${spriteName}`);
        }

        this.Frame = 0;
        this.UpdateWebglData();
    }

    get FrameId(): number { return this._currentFrame; }
    set Frame(frame: string | number) {
        if (frame == this._currentFrame) return;

        const f = GetFrameFromMultiFrameStorage(this._spriteData, frame);
        if (f > -1) {
            this._currentFrame = f;
            this.FrameData = this._spriteData.frames[this._currentFrame];
        }
    }
}