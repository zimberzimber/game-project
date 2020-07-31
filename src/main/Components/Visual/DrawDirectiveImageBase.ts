import { DrawDirectiveBase } from "./DrawDirectiveBase";
import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { ISpriteStorage, ISpriteFrame } from "../../Models/SpriteModels";
import { Vec2Utils } from "../../Utility/Vec2";
import { HorizontalAlignment, VerticalAlignment } from "../../Models/GenericInterfaces";

export abstract class DrawDirectiveImageBase extends DrawDirectiveBase {
    private _frame: ISpriteFrame = { origin: [0, 0], size: [0, 0] };
    set FrameData(frame: ISpriteFrame) {
        this._frame = frame;
        this.UpdateWebglData();
    }

    protected _size: Vec2;
    get Size(): Vec2 { return Vec2Utils.Copy(this._size); }
    set Size(size: Vec2) {
        this._size = Vec2Utils.Copy(size);
        this.CalculateBoundingRadius();
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

        const ox = this._size[0] * trans.Scale[0];
        const oy = this._size[1] * trans.Scale[1];
        const points: Vec2[] = [
            [origin[0], origin[1]],
            [origin[0], origin[1]],
            [origin[0], origin[1]],
            [origin[0], origin[1]],
        ];

        switch (this._horizontalAlignment) {
            case HorizontalAlignment.Left:
                points[0][0] += ox;
                points[3][0] += ox;
                break;
            case HorizontalAlignment.Middle:
                points[0][0] += ox / 2;
                points[1][0] -= ox / 2;
                points[2][0] -= ox / 2;
                points[3][0] += ox / 2;
                break;
            case HorizontalAlignment.Right:
                points[1][0] -= ox;
                points[2][0] -= ox;
                break;
        }

        switch (this._verticalAlignment) {
            case VerticalAlignment.Top:
                points[2][1] -= oy;
                points[3][1] -= oy;
                break;
            case VerticalAlignment.Middle:
                points[0][1] += oy / 2;
                points[1][1] += oy / 2;
                points[2][1] -= oy / 2;
                points[3][1] -= oy / 2;
                break;
            case VerticalAlignment.Bottom:
                points[0][1] += oy;
                points[1][1] += oy;
                break;
        }

        // Rotate points around the origin. Keeps alignment in mind.
        if (trans.RotationRadian != 0)
            for (let i = 0; i < points.length; i++)
                points[i] = Vec2Utils.RotatePointAroundCenter(points[i], trans.RotationRadian, origin)

        // Add the draw offset here, after the rotation so that the image is always rotated relative to itself.
        const f = this._frame;
        this._webglData.attributes = [
            points[0][0] + this._drawOffset[0], points[0][1] + this._drawOffset[1], trans.Depth, f.origin[0] + f.size[0], f.origin[1],
            points[1][0] + this._drawOffset[0], points[1][1] + this._drawOffset[1], trans.Depth, f.origin[0], f.origin[1],
            points[2][0] + this._drawOffset[0], points[2][1] + this._drawOffset[1], trans.Depth, f.origin[0], f.origin[1] + f.size[1],
            points[3][0] + this._drawOffset[0], points[3][1] + this._drawOffset[1], trans.Depth, f.origin[0] + f.size[0], f.origin[1] + f.size[1],
        ];
    }
}