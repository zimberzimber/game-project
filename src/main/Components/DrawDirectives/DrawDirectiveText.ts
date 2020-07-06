import { DrawDirectiveBase } from "./DrawDirectiveBase";
import { ITransformEventArgs } from "../../Models/Transform";
import { Sprites } from "../../Workers/SpriteManager";
import { IMultiFrameSpriteStorage, GetFrameFromMultiFrameStorage } from "../../Models/SpriteModels";
import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { Vec2Utils } from "../../Utility/Vec2";

export enum TextAlignmentHorizontal { Left, Center, Right }
export enum TextAlignmentVertical { Top, Center, Bottom }

export class DrawDirectiveText extends DrawDirectiveBase {
    protected readonly _spriteData: IMultiFrameSpriteStorage;

    constructor(parent: EntityBase, size: number, text: string, horizontalAlignment: TextAlignmentHorizontal = TextAlignmentHorizontal.Left, verticalAlignment: TextAlignmentVertical = TextAlignmentVertical.Top) {
        super(parent);
        this._spriteData = Sprites.GetAnimatedSpriteData('chars') || { imageId: 0, frames: [] };
        this._size = size;
        this._text = text.toLowerCase();
        this._horizontalAlignment = horizontalAlignment;
        this._verticalAlignment = verticalAlignment;
        this.CalculateDrawData();
    }

    private _text: string = '';
    get Text(): string { return this._text };
    set Text(text: string) {
        this._text = text.toLowerCase();
        this.CalculateDrawData();
    };

    private _size: number = 0;
    get Size(): number { return this._size; }
    set Size(size: number) {
        this._size = size;
        this.CalculateDrawData();
    }

    private _horizontalAlignment: TextAlignmentHorizontal = TextAlignmentHorizontal.Left;
    get HorizontalAlignment(): TextAlignmentHorizontal { return this._horizontalAlignment; }
    set HorizontalAlignment(alignment: TextAlignmentHorizontal) {
        this._horizontalAlignment = alignment;
        this.CalculateDrawData();
    }

    private _verticalAlignment: TextAlignmentVertical = TextAlignmentVertical.Top;
    get VerticalAlignment(): TextAlignmentVertical { return this._verticalAlignment; }
    set VerticalAlignment(alignment: TextAlignmentVertical) {
        this._verticalAlignment = alignment;
        this.CalculateDrawData();
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        this.CalculateDrawData();
    }

    private CalculateDrawData() {
        const trans = this._parent.worldRelativeTransform;
        const data: number[] = [];

        let currentLine = 0;
        let lineOffsets: Vec2[] = [[0, -this._size]]

        for (let i = 0; i < this._text.length; i++) {
            const c = this._text[i];

            if (c == '\n') {
                currentLine++;
                lineOffsets[currentLine] = [0, (currentLine + 1) * -this._size];
            } else if (this._horizontalAlignment != TextAlignmentHorizontal.Left) {
                lineOffsets[currentLine][0] += this._size;
            }
        }

        if (this._horizontalAlignment == TextAlignmentHorizontal.Center)
            lineOffsets.forEach(o => o[0] /= -2);
        else if (this._horizontalAlignment == TextAlignmentHorizontal.Right)
            lineOffsets.forEach(o => o[0] *= -1);

        if (this._verticalAlignment == TextAlignmentVertical.Center) {
            const sum = lineOffsets.length * this._size / 2;
            lineOffsets.forEach(o => o[1] += sum);
        } else if (this._verticalAlignment == TextAlignmentVertical.Bottom) {
            let sum = 0;
            lineOffsets.forEach(o => sum += o[1]);
            sum /= 2;
            lineOffsets.forEach(o => o[1] -= sum);
        }

        currentLine = 0;
        let offset: Vec2 = lineOffsets[0];

        for (let i = 0; i < this._text.length; i++) {
            const c = this._text[i];

            if (c == '\n') {
                currentLine++;
                offset = lineOffsets[currentLine];
            } else {
                let f = GetFrameFromMultiFrameStorage(this._spriteData, c);
                if (f == -1)
                    f = GetFrameFromMultiFrameStorage(this._spriteData, ' ');

                let p1: Vec2 = [trans.Position[0] + offset[0] + this._size, trans.Position[1] + offset[1] + this._size];
                let p2: Vec2 = [trans.Position[0] + offset[0], trans.Position[1] + offset[1] + this._size];
                let p3: Vec2 = [trans.Position[0] + offset[0], trans.Position[1] + offset[1]];
                let p4: Vec2 = [trans.Position[0] + offset[0] + this._size, trans.Position[1] + offset[1]];

                if (trans.RotationRadian != 0) {
                    p1 = Vec2Utils.RotatePointAroundCenter(p1, trans.RotationRadian, trans.Position);
                    p2 = Vec2Utils.RotatePointAroundCenter(p2, trans.RotationRadian, trans.Position);
                    p3 = Vec2Utils.RotatePointAroundCenter(p3, trans.RotationRadian, trans.Position);
                    p4 = Vec2Utils.RotatePointAroundCenter(p4, trans.RotationRadian, trans.Position);
                }

                const frame = this._spriteData.frames[f];
                data.push(p1[0], p1[1], trans.Depth, frame.origin[0] + frame.size[0], frame.origin[1]);
                data.push(p2[0], p2[1], trans.Depth, frame.origin[0], frame.origin[1]);
                data.push(p3[0], p3[1], trans.Depth, frame.origin[0], frame.origin[1] + frame.size[1]);
                data.push(p4[0], p4[1], trans.Depth, frame.origin[0] + frame.size[0], frame.origin[1] + frame.size[1]);

                offset[0] += this._size;
            }
        }

        this._webglData = data;
    }
}