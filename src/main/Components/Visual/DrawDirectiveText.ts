import { DrawDirectiveBase } from "./DrawDirectiveBase";
import { Sprites } from "../../Workers/SpriteManager";
import { IMultiFrameSpriteStorage, GetFrameFromMultiFrameStorage } from "../../Models/SpriteModels";
import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { Vec2Utils } from "../../Utility/Vec2";
import { Images } from "../../Workers/ImageManager";
import { HorizontalAlignment, VerticalAlignment } from "../../Models/GenericInterfaces";

export class DrawDirectiveText extends DrawDirectiveBase {
    protected readonly _spriteData: IMultiFrameSpriteStorage;

    private static _fontImageId: number = -2;
    get ImageId(): number { return DrawDirectiveText._fontImageId; }
    get IsTranslucent(): boolean { return this._spriteData.isTranslucent; }

    constructor(parent: EntityBase, size: number, text: string) {
        super(parent);
        this._spriteData = Sprites.GetAnimatedSpriteData('font_arial') || { imageId: 0, frames: [], isTranslucent: false };
        this._fontSize = size;
        this._text = text.toLowerCase();
        this.UpdateWebglData();

        if (DrawDirectiveText._fontImageId == -2)
            DrawDirectiveText._fontImageId = Images.GetImageIdFromName('font_arial');
    }

    private _text: string = '';
    get Text(): string { return this._text };
    set Text(text: string) {
        this._text = text;
        this.UpdateWebglData();
    };

    private _fontSize: number = 0;
    get FontSize(): number { return this._fontSize; }
    set FontSize(size: number) {
        this._fontSize = size;
        this.UpdateWebglData();
    }

    private GetFrameForChar(char: string): number {
        let f = GetFrameFromMultiFrameStorage(this._spriteData, char);
        if (f == -1)
            f = GetFrameFromMultiFrameStorage(this._spriteData, '?');
        return f;
    }

    protected UpdateWebglData() {
        const widths = this._spriteData.metadata.charWidths as number[];
        const maxCharHeight = this._spriteData.metadata.maxCharHeight as number;

        const trans = this._parent.worldRelativeTransform;
        this._webglData = { attributes: [], indexes: [] };

        let boundingWidth = 0;
        let boundingHeight = 0;
        let currentLine = 0;
        let lineOffsets: Vec2[] = [[0, -maxCharHeight]]

        for (let i = 0; i < this._text.length; i++) {
            const c = this._text[i];
            let f = this.GetFrameForChar(c);

            if (c == '\n') {
                if (lineOffsets[currentLine][0] > boundingWidth)
                    boundingWidth = lineOffsets[currentLine][0];

                currentLine++;
                lineOffsets[currentLine] = [0, (currentLine + 1) * -maxCharHeight];
            } else if (this._horizontalAlignment != HorizontalAlignment.Left) {
                lineOffsets[currentLine][0] += widths[f];
            }
        }
        boundingHeight = lineOffsets[currentLine][1];

        if (this._horizontalAlignment == HorizontalAlignment.Middle) {
            lineOffsets.forEach(o => o[0] /= -2);
            boundingWidth /= 2;
        }
        else if (this._horizontalAlignment == HorizontalAlignment.Right)
            lineOffsets.forEach(o => o[0] *= -1);

        if (this._verticalAlignment == VerticalAlignment.Middle) {
            const sum = lineOffsets.length * maxCharHeight / 2;
            lineOffsets.forEach(o => o[1] += sum);
            boundingHeight /= 2;
        } else if (this._verticalAlignment == VerticalAlignment.Bottom) {
            let highest = lineOffsets[currentLine][1];
            lineOffsets.forEach(o => o[1] -= highest);
        }

        currentLine = 0;
        let offset: Vec2 = lineOffsets[0];

        this._boundingRadius = Math.sqrt(boundingWidth * boundingWidth + boundingHeight * boundingHeight);
        for (let i = 0; i < this._text.length; i++) {
            const c = this._text[i];

            if (c == '\n') {
                currentLine++;
                offset = lineOffsets[currentLine];
            } else {
                let f = this.GetFrameForChar(c);

                let p1: Vec2 = [trans.Position[0] + offset[0] + widths[f], trans.Position[1] + offset[1] + maxCharHeight];
                let p2: Vec2 = [trans.Position[0] + offset[0], trans.Position[1] + offset[1] + maxCharHeight];
                let p3: Vec2 = [trans.Position[0] + offset[0], trans.Position[1] + offset[1]];
                let p4: Vec2 = [trans.Position[0] + offset[0] + widths[f], trans.Position[1] + offset[1]];

                if (trans.RotationRadian != 0) {
                    p1 = Vec2Utils.RotatePointAroundCenter(p1, trans.RotationRadian, trans.Position);
                    p2 = Vec2Utils.RotatePointAroundCenter(p2, trans.RotationRadian, trans.Position);
                    p3 = Vec2Utils.RotatePointAroundCenter(p3, trans.RotationRadian, trans.Position);
                    p4 = Vec2Utils.RotatePointAroundCenter(p4, trans.RotationRadian, trans.Position);
                }

                const frame = this._spriteData.frames[f];
                this._webglData.attributes.push(p1[0] + this._drawOffset[0], p1[1] + this._drawOffset[1], trans.Depth, frame.origin[0] + frame.size[0], frame.origin[1], this._opacity);
                this._webglData.attributes.push(p2[0] + this._drawOffset[0], p2[1] + this._drawOffset[1], trans.Depth, frame.origin[0], frame.origin[1], this._opacity);
                this._webglData.attributes.push(p3[0] + this._drawOffset[0], p3[1] + this._drawOffset[1], trans.Depth, frame.origin[0], frame.origin[1] + frame.size[1], this._opacity);
                this._webglData.attributes.push(p4[0] + this._drawOffset[0], p4[1] + this._drawOffset[1], trans.Depth, frame.origin[0] + frame.size[0], frame.origin[1] + frame.size[1], this._opacity);

                const o = (i - currentLine) * 4;
                this._webglData.indexes.push(...[
                    o, o + 1, o + 2,
                    o, o + 2, o + 3]);

                offset[0] += widths[f];
            }
        }
    }
}