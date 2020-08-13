import { ISingleFrameSpriteDefinition, IMultiFrameSpriteDefinition } from "../Models/SpriteModels";

export let SpriteDefinitions: { [key: string]: ISingleFrameSpriteDefinition | IMultiFrameSpriteDefinition } = {
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


    window_simple_00: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [0, 0],
            size: [3, 3]
        }
    },
    window_simple_01: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [3, 0],
            size: [1, 3]
        }
    },
    window_simple_02: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [4, 0],
            size: [3, 3]
        }
    },
    window_simple_10: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [0, 3],
            size: [3, 1]
        }
    },
    window_simple_11: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [3, 3],
            size: [1, 1]
        }
    },
    window_simple_12: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [4, 3],
            size: [3, 1]
        }
    },
    window_simple_20: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [0, 4],
            size: [3, 3]
        }
    },
    window_simple_21: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [3, 4],
            size: [1, 3]
        }
    },
    window_simple_22: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [4, 4],
            size: [3, 3]
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


    scroll_h_border_l: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [29, 0],
            size: [3, 5]
        }
    },
    scroll_h_border_r: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [39, 0],
            size: [3, 5]
        }
    },
    scroll_h_line: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [32, 0],
            size: [3, 5]
        }
    },
    scroll_h_pin: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [35, 0],
            size: [1, 5]
        }
    },
    scroll_h_slider: {
        sourceImageName: 'uiElements',
        frame: {
            origin: [36, 0],
            size: [3, 5]
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

    button_wide: {
        sourceImageName: 'uiElements',
        isTranslucent: true,
        names: ['passive', 'hovered', 'pressed'],
        frames: [
            {
                origin: [0, 23],
                size: [33, 7],
            },
            {
                origin: [0, 30],
                size: [33, 7],
            },
            {
                origin: [0, 37],
                size: [33, 7],
            },
        ]
    },
}

export let FontDefinitions: { [key: string]: { font: string, size: number, outlineWidth: number } } = {
    font_arial: { font: 'Arial', size: 20, outlineWidth: 2.5 }
}

export const ClearSpriteDefinitions = () => SpriteDefinitions = {};
export const ClearFontDefinitions = () => FontDefinitions = {};