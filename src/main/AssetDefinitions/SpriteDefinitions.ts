import { ISingleFrameSpriteDefinition, IMultiFrameSpriteDefinition } from "../Models/SpriteModels";
import { MiscUtil } from "../Utility/Misc";

export let SpriteDefinitions: { [key: string]: ISingleFrameSpriteDefinition | IMultiFrameSpriteDefinition } = {
    assetMissing: {
        sourceImageName: 'colors',
        isPixelCoordinates: true,
        frame: {
            origin: [0, 0],
            size: [16, 16]
        }
    },
    heart: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        frame: {
            origin: [16, 0],
            size: [16, 16]
        }
    },
    dice: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        names: ['one', 'two', 'three', 'four', 'five', 'six'],
        aliases: {
            odin: 'one',
            dva: 'two',
            tri: 'three',
            chetiri: 'four',
            pyat: 'five',
            shest: 'six'
        },
        frames: [
            {
                origin: [0, 16],
                size: [16, 16],
            },
            {
                origin: [16, 16],
                size: [16, 16],
            },
            {
                origin: [32, 16],
                size: [16, 16],
            },
            {
                origin: [48, 16],
                size: [16, 16],
            },
            {
                origin: [64, 16],
                size: [16, 16],
            },
            {
                origin: [80, 16],
                size: [16, 16],
            },
        ]
    },
    chars: {
        sourceImageName: 'font',
        names: ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z', '0', '1', '2', '3', '4', '5', '6', '7', '8', '9', '-', '*', '!', ' '],
        aliases: {
            A: 'a',
            B: 'b',
            C: 'c',
            D: 'd',
            E: 'e',
            F: 'f',
            G: 'g',
            H: 'h',
            I: 'i',
            J: 'j',
            K: 'k',
            L: 'l',
            M: 'm',
            N: 'n',
            O: 'o',
            P: 'p',
            Q: 'q',
            R: 'r',
            S: 's',
            T: 't',
            U: 'u',
            V: 'v',
            W: 'w',
            X: 'x',
            Y: 'y',
            Z: 'z'
        },
        frames: MiscUtil.GenerateTiles(8, 5, 8, 8, [64, 40]),
    }
}

export let FontDefinitions: { [key: string]: { font: string, size: number, outlineWidth: number } } = {
    font_arial: { font: 'Arial', size: 20, outlineWidth: 2.5 }
}

export const ClearSpriteDefinitions = () => SpriteDefinitions = {};
export const ClearFontDefinitions = () => FontDefinitions = {};