import { ISingleFrameSpriteDefinition, IMultiFrameSpriteDefinition } from "../Models/SpriteModels";

export const  SpriteDefinitions: { [key: string]: ISingleFrameSpriteDefinition | IMultiFrameSpriteDefinition } = {
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
    }
}