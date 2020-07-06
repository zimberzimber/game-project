import { ISpriteFrame } from "../Models/SpriteModels";
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
}