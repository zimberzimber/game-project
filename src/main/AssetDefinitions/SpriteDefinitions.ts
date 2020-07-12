import { ISingleFrameSpriteDefinition, IMultiFrameSpriteDefinition } from "../Models/SpriteModels";
import { MiscUtil } from "../Utility/Misc";

export let SpriteDefinitions: { [key: string]: ISingleFrameSpriteDefinition | IMultiFrameSpriteDefinition } = {
    assetMissing: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        frame: {
            origin: [83, 0],
            size: [4, 4]
        }
    },
    health_bar: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        names: ['root', 'full', 'empty'],
        frames: [
            {
                origin: [0, 0],
                size: [7, 10],
            },
            {
                origin: [7, 0],
                size: [19, 10],
            },
            {
                origin: [20, 0],
                size: [19, 10],
            },
        ]
    },
    energy_bar: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        names: ['root', 'full', 'empty'],
        frames: [
            {
                origin: [0, 10],
                size: [7, 10],
            },
            {
                origin: [7, 10],
                size: [19, 10],
            },
            {
                origin: [20, 10],
                size: [19, 10],
            },
        ]
    },
    button_wide: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        names: ['normal', 'faded'],
        frames: [
            {
                origin: [0, 20],
                size: [33, 7],
            },
            {
                origin: [0, 27],
                size: [33, 7],
            },
        ]
    },
    ori: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        names: ['0', '1', '2'],
        aliases: {
            3: '1',
        },
        frames: [
            {
                origin: [0, 34],
                size: [5, 15],
            },
            {
                origin: [5, 34],
                size: [5, 15],
            },
            {
                origin: [10, 34],
                size: [5, 15],
            },
        ]
    },
    ku: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        names: ['0', '1', '2', '3'],
        aliases: {
            4: '2',
            5: '1',
        },
        frames: [
            {
                origin: [15, 34],
                size: [18, 13],
            },
            {
                origin: [33, 34],
                size: [18, 13],
            },
            {
                origin: [51, 34],
                size: [18, 13],
            },
            {
                origin: [69, 34],
                size: [18, 13],
            },
        ]
    },
    skill_frame: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        frame: {
            origin: [33, 0],
            size: [10, 10]
        }
    },
    skill_bow: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        frame: {
            origin: [43, 0],
            size: [8, 8]
        }
    },
    skill_sword: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        frame: {
            origin: [51, 0],
            size: [8, 8]
        }
    },
    ui_pause: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        frame: {
            origin: [59, 0],
            size: [5, 5]
        }
    },
    pickup_health: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        frame: {
            origin: [33, 10],
            size: [4, 4]
        }
    },
    pickup_energy: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        frame: {
            origin: [33, 14],
            size: [4, 4]
        }
    },
    pickup_xp: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        frame: {
            origin: [33, 18],
            size: [4, 4]
        }
    },
    enemy: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        names: ['0', '1', '2'],
        aliases: {
            3: '1'
        },
        frames: [
            {
                origin: [33, 24],
                size: [8, 10],
            },
            {
                origin: [41, 24],
                size: [8, 10],
            },
            {
                origin: [49, 24],
                size: [8, 10],
            },
        ]
    },
    spikes: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        frame: {
            origin: [37, 10],
            size: [17, 9]
        }
    },
    spike_big: {
        sourceImageName: 'sprites',
        isPixelCoordinates: true,
        frame: {
            origin: [57, 12],
            size: [9, 22]
        }
    },
}

export let FontDefinitions: { [key: string]: { font: string, size: number, outlineWidth: number } } = {
    font_arial: { font: 'Arial', size: 20, outlineWidth: 2.5 }
}

export const ClearSpriteDefinitions = () => SpriteDefinitions = {};
export const ClearFontDefinitions = () => FontDefinitions = {};