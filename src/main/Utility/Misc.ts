import { ISpriteFrame, IMultiFrameSpriteDefinition } from "../Models/SpriteModels";
import { Vec2 } from "../Models/Vectors";
import { IComparingMethod } from "../Models/GenericInterfaces";

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

    static GenerateWebglTextureFromImage = (gl: WebGLRenderingContext, image: TexImageSource, wrap?: boolean): WebGLTexture => {
        const texture: WebGLTexture = MiscUtil.GenerateWebglEmptyTexture(gl, [0, 0], wrap);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }

    static GenerateWebglEmptyTexture = (gl: WebGLRenderingContext, size: Vec2, wrap?: boolean): WebGLTexture => {
        const texture: WebGLTexture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, texture);

        if (wrap) {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.REPEAT);
        } else {
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        }

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size[0], size[1], 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

        gl.bindTexture(gl.TEXTURE_2D, null);
        return texture;
    }
}

class LinkedListNode<T> {
    Next: LinkedListNode<T> | undefined;
    Value: T;

    constructor(value: T) {
        this.Value = value;
    }
}

export class SortedLinkedList<T> {
    private _first: LinkedListNode<T> | undefined;
    private _compare: IComparingMethod<T>;

    constructor(comparingMethod: IComparingMethod<T>) {
        this._compare = comparingMethod;
    }

    Add(value: T): void {
        const newNode = new LinkedListNode(value);
        if (!this._first) {
            this._first = newNode;
        } else if (this._compare(value, this._first.Value) == -1) {
            newNode.Next = this._first;
            this._first = newNode;
        } else {
            let node = this._first;
            let next = this._first.Next;

            while (next) {
                const c = this._compare(value, next.Value)
                if (c == -1) {
                    node.Next = newNode;
                    newNode.Next = next;
                    return;
                }
                node = next;
                next = next.Next;
            }

            node.Next = newNode;
        }
    }

    [Symbol.iterator]() { return this.Values(); }
    *Values() {
        let current = this._first;
        while (current) {
            yield current.Value;
            current = current.Next;
        }
    }
}