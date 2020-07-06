import { ISingleFrameSpriteDefinition, IMultiFrameSpriteDefinition } from "../Models/SpriteModels";
import { MiscUtil } from "../Utility/Misc";

export const SpriteDefinitions: { [key: string]: ISingleFrameSpriteDefinition | IMultiFrameSpriteDefinition } = {
    assetMissing: {
        sourceImageName: 'colors',
        frame: {
            origin: [0, 0],
            size: [0.125, 0.125]
        }
    },
    heart: {
        sourceImageName: 'sprites',
        frame: {
            origin: [0.125, 0],
            size: [0.125, 0.125]
        }
    },
    dice: {
        sourceImageName: 'sprites',
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
                origin: [0, 0.125],
                size: [0.125, 0.125],
            },
            {
                origin: [0.125, 0.125],
                size: [0.125, 0.125],
            },
            {
                origin: [0.250, 0.125],
                size: [0.125, 0.125],
            },
            {
                origin: [0.375, 0.125],
                size: [0.125, 0.125],
            },
            {
                origin: [0.500, 0.125],
                size: [0.125, 0.125],
            },
            {
                origin: [0.625, 0.125],
                size: [0.125, 0.125],
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