import { ISpriteFrame, IMultiFrameSpriteDefinition } from "../Models/SpriteModels";
import { Vec2 } from "../Models/Vectors";

export class MiscUtil {
    // Taken from: https://stackoverflow.com/questions/9267899/arraybuffer-to-base64-encoded-string
    static ArrayBufferToBase64String = (buffer: ArrayBuffer): string =>
        btoa([].reduce.call(new Uint8Array(buffer), (p: string, c: number) => p + String.fromCharCode(c), ''));

    static CopyArrayBuffer = (buffer: ArrayBuffer): ArrayBuffer =>
        buffer.slice(0);

    static GenerateTiles = (rows: number, columns: number, width: number, height: number, imageSize: Vec2, offset: Vec2 = [0, 0]): ISpriteFrame[] => {
        const tiles: ISpriteFrame[] = [];

        for (let y = 0; y < columns; y++)
            for (let x = 0; x < rows; x++)
                tiles.push({
                    origin: [width / imageSize[0] * x + offset[0], height / imageSize[1] * y + offset[1]],
                    size: [width / imageSize[0], height / imageSize[1]]
                });

        return tiles;
    }

    static GenerateASCIITextImage = (fontName: string, fontSize: number, outlineWidth: number, maxWidth: number = 500): {
        image: HTMLImageElement, frames: ISpriteFrame[], names: string[], charWidths: number[], maxCharHeight: number
    } => {
        const fullAscii = " !\"#$%&'()*+,-./0123456789:;<=>?@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_`abcdefghijklmnopqrstuvwxyz{|}~";
        const ctx = document.createElement('canvas').getContext('2d')!;
        const fontShorthand = `${fontSize}px "${fontName}"`;
        const image = new Image();

        let maxDescent = 0
        let maxAscent = 0
        let offset = [0, 0];

        const names: string[] = [];
        const frames: ISpriteFrame[] = [];
        const charWidths: number[] = [];

        //@ts-ignore
        document.fonts.load(fontShorthand).then(() => ctx.font = fontShorthand);

        for (const c of fullAscii) {
            const size = ctx.measureText(c)

            if (Math.ceil(size.actualBoundingBoxDescent) > maxDescent)
                maxDescent = Math.ceil(size.actualBoundingBoxDescent);

            if (Math.ceil(size.actualBoundingBoxAscent) > maxAscent)
                maxAscent = Math.ceil(size.actualBoundingBoxAscent);
        }

        maxDescent += outlineWidth;
        maxAscent += outlineWidth;

        offset = [outlineWidth, fontSize]
        let canvasWidth = 0;
        for (const c of fullAscii) {
            const cw = ctx.measureText(c).width + outlineWidth * 2
            if (offset[0] + cw > maxWidth) {
                if (offset[0] > canvasWidth)
                    canvasWidth = offset[0];
                offset = [outlineWidth, offset[1] + fontSize + maxDescent];
            }
            offset[0] += cw;
        }

        ctx.canvas.width = canvasWidth;
        ctx.canvas.height = offset[1] + maxDescent;
        ctx.font = fontShorthand;
        ctx.lineWidth = outlineWidth;
        ctx.strokeStyle = 'black';
        ctx.fillStyle = 'white';

        const maxCharHeight: number = fontSize + maxDescent;
        offset = [outlineWidth, fontSize]

        for (const c of fullAscii) {
            const cw = ctx.measureText(c).width + outlineWidth * 2
            if (offset[0] + cw > maxWidth)
                offset = [outlineWidth, offset[1] + fontSize + maxDescent];

            const kk: ISpriteFrame = {
                origin: [offset[0], offset[1] - fontSize],
                size: [cw, fontSize + maxDescent]
            }

            ctx.fillStyle = 'white';
            ctx.strokeText(c, offset[0] + outlineWidth, offset[1]);
            ctx.fillText(c, offset[0] + outlineWidth, offset[1]);

            names.push(c);
            frames.push(kk);

            offset[0] += cw;
            charWidths.push(cw);
        }

        image.src = ctx.canvas.toDataURL();
        return { image, names, frames, charWidths, maxCharHeight };
    }
}