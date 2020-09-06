import { ISingleFrameSpriteDefinition, IMultiFrameSpriteDefinition, ISpriteFrame } from "../Models/SpriteModels";
import { Vec2 } from "../Models/Vectors";
import { Vec2Utils } from "../Utility/Vec2";

let Util = {
    GenerateTiles: (rows: number, columns: number, width: number, height: number, offset: Vec2 = [0, 0]): ISpriteFrame[] => {
        const tiles: ISpriteFrame[] = [];

        for (let y = 0; y < columns; y++)
            for (let x = 0; x < rows; x++)
                tiles.push({
                    origin: [width * x + offset[0], height * y + offset[1]],
                    size: [width, height]
                });

        return tiles;
    },

    AddWindowBox: (name: string, sourceImageName: string, origin: Vec2, sizes: IVec2Grid3x3): { [key: string]: ISingleFrameSpriteDefinition } => {
        const defs: { [key: string]: ISingleFrameSpriteDefinition } = {};
        const offset: Vec2 = [0, 0];

        for (let r = 0; r < sizes.length; r++) {
            for (let c = 0; c < sizes[r].length; c++) {
                defs[`${name}_${r}${c}`] = {
                    sourceImageName,
                    frame: {
                        origin: [
                            origin[0] + offset[0],
                            origin[1] + offset[1]
                        ],
                        size: [
                            sizes[r][c][0],
                            sizes[r][c][1]
                        ]
                    }
                };
                offset[0] += sizes[r][c][0];
            }
            offset[0] = 0;
            offset[1] += sizes[r][0][1];
        }

        return defs;
    },

    AddButton: (sourceImageName: string, origin: Vec2, size: Vec2): IMultiFrameSpriteDefinition => {
        return {
            sourceImageName,
            names: ['passive', 'hovered', 'pressed'],
            frames: [
                {
                    origin: Vec2Utils.Copy(origin),
                    size: Vec2Utils.Copy(size),
                },
                {
                    origin: [origin[0], origin[1] + size[1]],
                    size: Vec2Utils.Copy(size),
                },
                {
                    origin: [origin[0], origin[1] + size[1] + size[1]],
                    size: Vec2Utils.Copy(size),
                },
            ]
        };
    },

    AddSlider: (name: string, sourceImageName: string, barOrigin: Vec2, barSize: Vec2, pinOrigin: Vec2, pinSize: Vec2, nubOrigin: Vec2, nubSize: Vec2, leftBorderOrigin: Vec2, leftBorderSize: Vec2, rightBorderOrigin: Vec2, rightBorderSize: Vec2): { [key: string]: ISingleFrameSpriteDefinition } => {
        return {
            [`${name}_bar`]: {
                sourceImageName,
                frame: {
                    origin: barOrigin,
                    size: barSize
                }
            },
            [`${name}_pin`]: {
                sourceImageName,
                frame: {
                    origin: pinOrigin,
                    size: pinSize
                }
            },
            [`${name}_nub`]: {
                sourceImageName,
                frame: {
                    origin: nubOrigin,
                    size: nubSize
                }
            },
            [`${name}_border_l`]: {
                sourceImageName,
                frame: {
                    origin: leftBorderOrigin,
                    size: leftBorderSize
                }
            },
            [`${name}_border_r`]: {
                sourceImageName,
                frame: {
                    origin: rightBorderOrigin,
                    size: rightBorderSize
                }
            }
        };
    },
}

export let SpriteDefinitions: { [key: string]: ISingleFrameSpriteDefinition | IMultiFrameSpriteDefinition } = {
    color_yellow: {
        sourceImageName: 'colors',
        frame: {
            origin: [0, 0],
            size: [1, 1]
        }
    },
    color_red: {
        sourceImageName: 'colors',
        frame: {
            origin: [1, 0],
            size: [1, 1]
        }
    },
    color_green: {
        sourceImageName: 'colors',
        frame: {
            origin: [2, 0],
            size: [1, 1]
        }
    },
    color_blue: {
        sourceImageName: 'colors',
        frame: {
            origin: [3, 0],
            size: [1, 1]
        }
    },
    color_white: {
        sourceImageName: 'colors',
        frame: {
            origin: [0, 1],
            size: [1, 1]
        }
    },
    color_gray: {
        sourceImageName: 'colors',
        frame: {
            origin: [1, 1],
            size: [1, 1]
        }
    },
    color_black: {
        sourceImageName: 'colors',
        frame: {
            origin: [2, 1],
            size: [1, 1]
        }
    },
    color_transparent: {
        sourceImageName: 'colors',
        frame: {
            origin: [3, 1],
            size: [1, 1]
        }
    },

    asset_missing: {
        sourceImageName: 'sprites',
        frame: {
            origin: [83, 0],
            size: [4, 4]
        }
    },
    health_bar: {
        sourceImageName: 'sprites',
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
    ori: {
        sourceImageName: 'sprites',
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
        frame: {
            origin: [33, 0],
            size: [10, 10]
        }
    },
    skill_bow: {
        sourceImageName: 'sprites',
        frame: {
            origin: [43, 0],
            size: [8, 8]
        }
    },
    skill_sword: {
        sourceImageName: 'sprites',
        frame: {
            origin: [51, 0],
            size: [8, 8]
        }
    },
    ui_pause: {
        sourceImageName: 'sprites',
        frame: {
            origin: [59, 0],
            size: [5, 5]
        }
    },
    pickup_health: {
        sourceImageName: 'sprites',
        frame: {
            origin: [33, 10],
            size: [4, 4]
        }
    },
    pickup_energy: {
        sourceImageName: 'sprites',
        frame: {
            origin: [33, 14],
            size: [4, 4]
        }
    },
    pickup_xp: {
        sourceImageName: 'sprites',
        frame: {
            origin: [33, 18],
            size: [4, 4]
        }
    },
    enemy: {
        sourceImageName: 'sprites',
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
        frame: {
            origin: [37, 10],
            size: [17, 9]
        }
    },
    spike_big: {
        sourceImageName: 'sprites',
        frame: {
            origin: [57, 12],
            size: [9, 22]
        }
    },
    beam: {
        sourceImageName: 'sprites',
        frame: {
            origin: [66, 24],
            size: [5, 10]
        }
    },

    button_cancel: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [7, 0],
            size: [11, 11]
        }
    },
    button_accept: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [18, 0],
            size: [11, 11]
        }
    },

    header_1_l: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [0, 11],
            size: [5, 4]
        }
    },
    header_1_fill: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [5, 11],
            size: [1, 4]
        }
    },
    header_1_r: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [6, 11],
            size: [5, 4]
        }
    },

    ui_health: {
        sourceImageName: 'uiElements',
        names: ['empty', 'full'],
        frames: [
            {
                origin: [11, 11],
                size: [6, 6],
            },
            {
                origin: [17, 11],
                size: [6, 6],
            },
        ]
    },
    ui_energy: {
        sourceImageName: 'uiElements',
        names: ['empty', 'full'],
        frames: [
            {
                origin: [11, 17],
                size: [6, 6],
            },
            {
                origin: [17, 17],
                size: [6, 6],
            },
        ]
    },
    ui_score: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [23, 11],
            size: [6, 6]
        }
    },

    tick_box: {
        sourceImageName: 'uiElements',
        names: ['unselected', 'selected'],
        frames: [
            {
                origin: [29, 5],
                size: [6, 6],
            },
            {
                origin: [35, 5],
                size: [6, 6],
            },
        ]
    },

    arrow_small_left: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [29, 11],
            size: [3, 5]
        }
    },
    arrow_small_right: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [32, 11],
            size: [3, 5]
        }
    },

    button_wide: Util.AddButton('uiElements', [0, 23], [33, 7]),

    ...Util.AddWindowBox('window_simple', 'uiElements', [0, 0], [
        [[3, 3], [1, 3], [3, 3]],
        [[3, 1], [1, 1], [3, 1]],
        [[3, 3], [1, 3], [3, 3]]]),

    ...Util.AddSlider('slider_basic', 'uiElements', [32, 0], [3, 5], [35, 0], [1, 5], [36, 0], [3, 5], [29, 0], [3, 5], [39, 0], [3, 5]),
}

export let FontDefinitions: { [key: string]: { font: string, size: number, outlineWidth: number } } = {
    font_arial: { font: 'Arial', size: 20, outlineWidth: 2.5 }
}

interface IVec2Grid3x3 extends Array<[Vec2, Vec2, Vec2]> {
    0: [Vec2, Vec2, Vec2];
    1: [Vec2, Vec2, Vec2];
    2: [Vec2, Vec2, Vec2];
}

export const DisposeSpriteDefinitions = (): void => {
    SpriteDefinitions = {};
    FontDefinitions = {};
    //@ts-ignore shhhhhhhh I know
    Util = {};
}