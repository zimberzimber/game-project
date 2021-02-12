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

    AddWindowBox: (name: string, sourceImageName: string, origin: Vec2, isTranslucent: boolean, sizes: IVec2Grid3x3): { [key: string]: ISingleFrameSpriteDefinition } => {
        const defs: { [key: string]: ISingleFrameSpriteDefinition } = {};
        const offset: Vec2 = [0, 0];

        for (let r = 0; r < sizes.length; r++) {
            for (let c = 0; c < sizes[r].length; c++) {
                defs[`${name}_${r}${c}`] = {
                    sourceImageName,
                    isTranslucent: isTranslucent ? true : undefined,
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

    AddButton: (sourceImageName: string, origin: Vec2, size: Vec2, isTranslucent: boolean = false): IMultiFrameSpriteDefinition => {
        return {
            sourceImageName,
            names: ['passive', 'hovered', 'pressed'],
            isTranslucent: isTranslucent ? true : undefined,
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
    color_red: {
        sourceImageName: 'colors',
        frame: {
            origin: [0, 0],
            size: [1, 1]
        }
    },
    color_green: {
        sourceImageName: 'colors',
        frame: {
            origin: [1, 0],
            size: [1, 1]
        }
    },
    color_blue: {
        sourceImageName: 'colors',
        frame: {
            origin: [2, 0],
            size: [1, 1]
        }
    },
    color_yellow: {
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
        sourceImageName: 'ui_elements',
        frame: {
            origin: [7, 0],
            size: [11, 11]
        }
    },
    button_accept: {
        sourceImageName: 'ui_elements',
        frame: {
            origin: [18, 0],
            size: [11, 11]
        }
    },

    header_1_l: {
        sourceImageName: 'ui_elements',
        frame: {
            origin: [0, 11],
            size: [5, 4]
        }
    },
    header_1_fill: {
        sourceImageName: 'ui_elements',
        frame: {
            origin: [5, 11],
            size: [1, 4]
        }
    },
    header_1_r: {
        sourceImageName: 'ui_elements',
        frame: {
            origin: [6, 11],
            size: [5, 4]
        }
    },

    ui_health: {
        sourceImageName: 'ui_elements',
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
        sourceImageName: 'ui_elements',
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
        sourceImageName: 'ui_elements',
        frame: {
            origin: [23, 11],
            size: [6, 6]
        }
    },

    tick_box: {
        sourceImageName: 'ui_elements',
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
        sourceImageName: 'ui_elements',
        frame: {
            origin: [29, 11],
            size: [3, 5]
        }
    },
    arrow_small_right: {
        sourceImageName: 'ui_elements',
        frame: {
            origin: [32, 11],
            size: [3, 5]
        }
    },

    floater: {
        sourceImageName: 'enemies',
        frame: {
            origin: [0, 0],
            size: [45, 40]
        }
    },
    floater_death: {
        sourceImageName: 'enemies',
        names: ['0', '1', '2'],
        frames: [
            {
                origin: [45, 0],
                size: [45, 40]
            },
            {
                origin: [90, 0],
                size: [45, 40]
            },
            {
                origin: [135, 0],
                size: [45, 40]
            },
        ]
    },

    spider: {
        sourceImageName: 'spiders',
        names: [
            "drop_0", "drop_1", "drop_2", "idle_0",
            "idle_1", "idle_2", "idle_3"
        ],
        aliases: {
            drop_3: "drop_1"
        },
        frames: [
            {
                origin: [0, 0],
                size: [24, 26]
            },
            {
                origin: [24, 0],
                size: [24, 26]
            },
            {
                origin: [48, 0],
                size: [24, 26]
            },
            {
                origin: [72, 0],
                size: [24, 26]
            },

            {
                origin: [0, 26],
                size: [24, 26]
            },
            {
                origin: [24, 26],
                size: [24, 26]
            },
            {
                origin: [48, 26],
                size: [24, 26]
            },
        ]
    },
    spider_dead: {
        sourceImageName: 'spiders',
        frame: {
            origin: [48, 26],
            size: [24, 26]
        }
    },
    spider_web: {
        sourceImageName: 'spiders',
        frame: {
            origin: [72, 26],
            size: [26, 26]
        }
    },
    spider_string: {
        sourceImageName: 'spiders',
        isTranslucent: true,
        frame: {
            origin: [96, 0],
            size: [2, 26]
        }
    },
    spider_string_gib: {
        sourceImageName: 'spiders',
        isTranslucent: true,
        frame: {
            origin: [0, 52],
            size: [4, 3]
        }
    },
    pentagon_purple: {
        sourceImageName: 'particles',
        frame: {
            origin: [0, 0],
            size: [64, 64]
        },
    },
    ori_arrow: {
        sourceImageName: 'particles',
        isTranslucent: true,
        frame: {
            origin: [64, 0],
            size: [64, 64]
        },
    },
    flake_white: {
        sourceImageName: 'particles',
        isTranslucent: true,
        frame: {
            origin: [0, 64],
            size: [47, 47]
        },
    },
    flake_green: {
        sourceImageName: 'particles',
        isTranslucent: true,
        frame: {
            origin: [47, 64],
            size: [47, 47]
        },
    },
    flake_cyan: {
        sourceImageName: 'particles',
        isTranslucent: true,
        frame: {
            origin: [94, 64],
            size: [47, 47]
        },
    },


    ori_sword_swing: {
        sourceImageName: 'sword_swing',
        isTranslucent: true,
        frames: [
            {
                origin: [0, 0],
                size: [131, 119]
            },
            {
                origin: [131, 0],
                size: [131, 119]
            },
            {
                origin: [262, 0],
                size: [131, 119]
            },
            {
                origin: [393, 0],
                size: [131, 119]
            }
        ]
    },
    ori_hammer_swing: {
        sourceImageName: 'hammer_swing',
        isTranslucent: true,
        frames: [
            {
                origin: [0, 0],
                size: [131, 119]
            },
            {
                origin: [131, 0],
                size: [131, 119]
            },
            {
                origin: [262, 0],
                size: [131, 119]
            },
            {
                origin: [393, 0],
                size: [131, 119]
            }
        ]
    },

    hp_gauge: {
        sourceImageName: 'hp_gauge',
        isTranslucent: false,
        frame: {
            origin: [0, 0],
            size: [101, 101]
        }
    },
    hp_gauge_bg: {
        sourceImageName: 'hp_gauge',
        isTranslucent: false,
        frame: {
            origin: [101, 0],
            size: [101, 101]
        }
    },

    energy_gauge: {
        sourceImageName: 'energy_gauge',
        isTranslucent: false,
        frame: {
            origin: [0, 0],
            size: [101, 101]
        }
    },
    energy_gauge_bg: {
        sourceImageName: 'energy_gauge',
        isTranslucent: false,
        frame: {
            origin: [101, 0],
            size: [101, 101]
        }
    },
    resource_container: {
        sourceImageName: 'resource_container',
        isTranslucent: false,
        frame: {
            origin: [0, 0],
            size: [120, 120]
        }
    },
    health_bar_root: {
        sourceImageName: 'ui_elements',
        names: ['full', 'empty'],
        frames: [
            {
                origin: [52, 32],
                size: [5, 6],
            },
            {
                origin: [52, 38],
                size: [5, 6],
            },
        ]
    },
    health_bar: {
        sourceImageName: 'ui_elements',
        names: ['full', 'empty'],
        frames: [
            {
                origin: [57, 32],
                size: [14, 6],
            },
            {
                origin: [57, 38],
                size: [14, 6],
            },
        ]
    },
    energy_bar_root: {
        sourceImageName: 'ui_elements',
        names: ['full', 'empty'],
        frames: [
            {
                origin: [47, 32],
                size: [5, 6],
            },
            {
                origin: [47, 38],
                size: [5, 6],
            },
        ]
    },
    energy_bar: {
        sourceImageName: 'ui_elements',
        names: ['full', 'empty'],
        frames: [
            {
                origin: [33, 32],
                size: [14, 6],
            },
            {
                origin: [33, 38],
                size: [14, 6],
            },
        ]
    },
    weapon_frame: {
        sourceImageName: 'ui_elements',
        names: ["default", "locked"],
        isTranslucent: true,
        frames: [
            {
                origin: [42, 0],
                size: [18, 18]
            },
            {
                origin: [60, 0],
                size: [18, 18]
            },
        ]
    },

    weapon_icons: {
        sourceImageName: 'ui_elements',
        names: ["melee", "ranged", "special"],
        frames: [
            {
                origin: [33, 19],
                size: [13, 13]
            },
            {
                origin: [46, 19],
                size: [13, 13]
            },
            {
                origin: [59, 19],
                size: [13, 13]
            }
        ]
    },

    ori_star: {
        sourceImageName: 'ui_elements',
        frame: {
            origin: [59, 19],
            size: [13, 13]
        }
    },
    shockwave: {
        sourceImageName: 'shockwave',
        isTranslucent: true,
        frame: {
            origin: [0, 0],
            size: [47, 47]
        },
    },

    ui_score_bar_full: {
        sourceImageName: 'ui_elements',
        frame: {
            origin: [0, 44],
            size: [68, 9]
        },
    },
    ui_score_bar_empty: {
        sourceImageName: 'ui_elements',
        frame: {
            origin: [0, 53],
            size: [68, 9]
        },
    },


    button_wide: Util.AddButton('ui_elements', [0, 23], [33, 7], true),

    ...Util.AddWindowBox('window_simple', 'ui_elements', [0, 0], true, [
        [[3, 3], [1, 3], [3, 3]],
        [[3, 1], [1, 1], [3, 1]],
        [[3, 3], [1, 3], [3, 3]]]),

    ...Util.AddSlider('slider_basic', 'ui_elements', [32, 0], [3, 5], [35, 0], [1, 5], [36, 0], [3, 5], [29, 0], [3, 5], [39, 0], [3, 5]),
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