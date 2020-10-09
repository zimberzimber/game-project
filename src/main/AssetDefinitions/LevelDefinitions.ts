import { TestEntity } from "../Entities/Test";
import { VerticalAlignment } from "../Models/GenericInterfaces";
import { ILevelDef } from "../Models/LevelModels";
import { MiscUtil } from "../Utility/Misc";

export const LevelDictionary: { [key: string]: ILevelDef } = {
    lv_00: {
        length: 1000,
        speed: 1,
        music: 'music_game',
        bgConfig: {
            back: [
                {
                    imageName: 'bg_00',
                    tileWidth: 1200,
                    height: 500,
                    scrollSpeed: 1,
                    scrollOverLength: 1000
                },
                {
                    imageName: 'fbg_00',
                    tileWidth: 300,
                    height: 175,
                    scrollSpeed: 2,
                }
            ],
            front: [
                {
                    imageName: 'fg_00',
                    tileWidth: 512,
                    height: 80,
                    scrollSpeed: 5,
                },
                {
                    imageName: 'ffg_00',
                    tileWidth: 1024,
                    height: 80,
                    scrollSpeed: 10,
                    verticalAlignment: VerticalAlignment.Top,
                }
            ],
            backDepthOffset: -5,
            frontDepthOffset: 5,
            length: 1000,
            globalLight: MiscUtil.HexToRGB('FFFFFF'),
            // globalLight: MiscUtil.HexToRGB('300389'),
        },
        entities: [
            {
                entityType: TestEntity,
                position: [0, -200]
            },
            {
                entityType: TestEntity,
                position: [50, -200]
            },
            {
                entityType: TestEntity,
                position: [100, -200]
            }
        ]
    }
}