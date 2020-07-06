import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { Sprites } from "../../Workers/SpriteManager";
import { Vec2Utils } from "../../Utility/Vec2";
import { IMultiFrameSpriteStorage, GetFrameFromMultiFrameStorage } from "../../Models/SpriteModels";
import { DrawDirectiveImageBase } from "./DrawDirectiveImageBase";
import { ITransformEventArgs } from "../../Models/Transform";

export class DrawDirectiveAnimatedImage extends DrawDirectiveImageBase {
    Size: Vec2;
    protected readonly _spriteData: IMultiFrameSpriteStorage;
    private _currentFrame: number = 0;

    constructor(parent: EntityBase, spriteName: string, size: Vec2 = [0, 0]) {
        super(parent, size);
        this._spriteData = Sprites.GetAnimatedSpriteData(spriteName) || { imageId: 0, frames: [] };
        this._webglData.indexes = [
            0, 1, 2,
            0, 2, 3
        ];
    }

    get FrameId(): number { return this._currentFrame; }
    set Frame(frame: string | number) {
        const f = GetFrameFromMultiFrameStorage(this._spriteData, frame);
        if (f > -1)
            this._currentFrame = f;
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
                p1[0], p1[1], trans.Depth, sd.frames[this._currentFrame].origin[0] + sd.frames[this._currentFrame].size[0], sd.frames[this._currentFrame].origin[1],
                p2[0], p2[1], trans.Depth, sd.frames[this._currentFrame].origin[0], sd.frames[this._currentFrame].origin[1],
                p3[0], p3[1], trans.Depth, sd.frames[this._currentFrame].origin[0], sd.frames[this._currentFrame].origin[1] + sd.frames[this._currentFrame].size[1],
                p4[0], p4[1], trans.Depth, sd.frames[this._currentFrame].origin[0] + sd.frames[this._currentFrame].size[0], sd.frames[this._currentFrame].origin[1] + sd.frames[this._currentFrame].size[1],
            ];
        } else {
            this._webglData.attributes = [
                trans.Position[0] + ox, trans.Position[1] + oy, trans.Depth, sd.frames[this._currentFrame].origin[0] + sd.frames[this._currentFrame].size[0], sd.frames[this._currentFrame].origin[1],
                trans.Position[0] - ox, trans.Position[1] + oy, trans.Depth, sd.frames[this._currentFrame].origin[0], sd.frames[this._currentFrame].origin[1],
                trans.Position[0] - ox, trans.Position[1] - oy, trans.Depth, sd.frames[this._currentFrame].origin[0], sd.frames[this._currentFrame].origin[1] + sd.frames[this._currentFrame].size[1],
                trans.Position[0] + ox, trans.Position[1] - oy, trans.Depth, sd.frames[this._currentFrame].origin[0] + sd.frames[this._currentFrame].size[0], sd.frames[this._currentFrame].origin[1] + sd.frames[this._currentFrame].size[1],
            ];
        }
    }
}