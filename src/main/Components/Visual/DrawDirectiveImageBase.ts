import { DrawDirectiveBase } from "./DrawDirectiveBase";
import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { ISpriteFrame } from "../../Models/SpriteModels";
import { Vec2Utils } from "../../Utility/Vec2";
import { HorizontalAlignment, VerticalAlignment } from "../../Models/GenericInterfaces";
import { ScalarUtil } from "../../Utility/Scalar";
import { MiscUtil } from "../../Utility/Misc";

export abstract class DrawDirectiveImageBase extends DrawDirectiveBase {
    protected _frameData: ISpriteFrame = { origin: [0, 0], size: [0, 0] };
    set FrameData(frame: ISpriteFrame) {
        this._frameData = frame;
        this.UpdateWebglData();
    }

    protected _size: Vec2;
    get Size(): Vec2 { return Vec2Utils.Copy(this._size); }
    set Size(size: Vec2) {
        this._size = Vec2Utils.Copy(size);
        this.CalculateBoundingRadius();
        this.UpdateWebglData();
    }

    protected _cutOff: Vec2 | undefined;
    get Cutoff(): Vec2 | null {
        if (this._cutOff) return Vec2Utils.Copy(this._cutOff);
        return null;
    }
    set Cutoff(cutoff: Vec2 | null) {
        // Unset cutoff if the passed values represent drawing the full image as normal
        if (cutoff && !(cutoff[0] >= 1 && cutoff[1] >= 1))
            this._cutOff = [
                ScalarUtil.Clamp(0, cutoff[0], 1),
                ScalarUtil.Clamp(0, cutoff[1], 1)
            ];
        else
            delete this._cutOff;
        this.UpdateWebglData();
    }

    constructor(parent: EntityBase, size: Vec2 = [0, 0]) {
        super(parent);
        this._size = Vec2Utils.Copy(size);
        this.CalculateBoundingRadius();
        this._webglData.indexes = [
            0, 1, 2,
            0, 2, 3
        ];
    }

    private CalculateBoundingRadius(): void {
        const trans = this._parent.worldRelativeTransform;
        this._boundingRadius = Math.sqrt(Math.pow(this._size[0] * trans.Scale[0], 2) + Math.pow(this._size[1] * trans.Scale[1], 2));
    }

    protected UpdateWebglData() {
        const trans = this._parent.worldRelativeTransform;
        const origin = trans.Position; // prevent redundant copying from source

        const points: Vec2[] = MiscUtil.CreateAlignmentBasedBox(origin, this._verticalAlignment, this._horizontalAlignment, Vec2Utils.Mult(this._size, trans.Scale));

        // Rotate points around the origin. Keeps alignment in mind.
        if (trans.RotationRadian != 0)
            for (let i = 0; i < points.length; i++)
                points[i] = Vec2Utils.RotatePointAroundCenter(points[i], trans.RotationRadian, origin)

        // Add the draw offset here, after the rotation so that the image is always rotated relative to itself.
        const f = this._frameData;
        this._webglData.attributes = [
            points[0][0] + this._drawOffset[0], points[0][1] + this._drawOffset[1], trans.Depth + this._depthOffset, f.origin[0] + f.size[0], f.origin[1], this._opacity,
            points[1][0] + this._drawOffset[0], points[1][1] + this._drawOffset[1], trans.Depth + this._depthOffset, f.origin[0], f.origin[1], this._opacity,
            points[2][0] + this._drawOffset[0], points[2][1] + this._drawOffset[1], trans.Depth + this._depthOffset, f.origin[0], f.origin[1] + f.size[1], this._opacity,
            points[3][0] + this._drawOffset[0], points[3][1] + this._drawOffset[1], trans.Depth + this._depthOffset, f.origin[0] + f.size[0], f.origin[1] + f.size[1], this._opacity,
        ];

        // Apply cutoff
        if (this._cutOff) {
            const scale = this.Parent.worldRelativeTransform.Scale;

            // 0  . . 3  . .
            // 6  . . 9  . .
            // 12 . . 15 . .
            // 18 . . 21 . .
            if (this._cutOff[0] < 1) {
                let pointDiff = this._size[0] * scale[0] * (1 - this._cutOff[0]);
                let frameDiff = this._frameData.size[0] * (1 - this._cutOff[0]);

                switch (this._horizontalAlignment) {
                    case HorizontalAlignment.Left:
                        this._webglData.attributes[0] -= pointDiff;
                        this._webglData.attributes[18] -= pointDiff;

                        this._webglData.attributes[3] -= frameDiff;
                        this._webglData.attributes[21] -= frameDiff;
                        break;
                    case HorizontalAlignment.Middle:
                        pointDiff *= 0.5;
                        frameDiff *= 0.5;

                        this._webglData.attributes[0] -= pointDiff;
                        this._webglData.attributes[6] += pointDiff;
                        this._webglData.attributes[12] += pointDiff;
                        this._webglData.attributes[18] -= pointDiff;

                        this._webglData.attributes[3] -= frameDiff;
                        this._webglData.attributes[9] += frameDiff;
                        this._webglData.attributes[15] += frameDiff;
                        this._webglData.attributes[21] -= frameDiff;
                        break;
                    default:
                        this._webglData.attributes[6] += pointDiff;
                        this._webglData.attributes[12] += pointDiff;

                        this._webglData.attributes[9] += frameDiff;
                        this._webglData.attributes[15] += frameDiff;
                        break;
                }
            }

            // .  1 . .  4 .
            // .  7 . . 10 .
            // . 13 . . 16 .
            // . 19 . . 22 .
            if (this._cutOff[1] < 1) {
                let pointDiff = this._size[1] * scale[1] * (1 - this._cutOff[1]);
                let frameDiff = this._frameData.size[1] * (1 - this._cutOff[1]);
                switch (this._verticalAlignment) {
                    case VerticalAlignment.Top:
                        this._webglData.attributes[1] -= pointDiff;
                        this._webglData.attributes[7] -= pointDiff;

                        this._webglData.attributes[4] += frameDiff;
                        this._webglData.attributes[10] += frameDiff;
                        break;
                    case VerticalAlignment.Middle:
                        pointDiff *= 0.5;
                        frameDiff *= 0.5;

                        this._webglData.attributes[1] -= pointDiff;
                        this._webglData.attributes[7] -= pointDiff;
                        this._webglData.attributes[13] += pointDiff;
                        this._webglData.attributes[19] += pointDiff;

                        this._webglData.attributes[4] += frameDiff;
                        this._webglData.attributes[10] += frameDiff;
                        this._webglData.attributes[16] -= frameDiff;
                        this._webglData.attributes[22] -= frameDiff;
                        break;
                    default:
                        this._webglData.attributes[13] += pointDiff;
                        this._webglData.attributes[19] += pointDiff;

                        this._webglData.attributes[16] -= frameDiff;
                        this._webglData.attributes[22] -= frameDiff;
                        break;
                }
            }
        }
    }
}