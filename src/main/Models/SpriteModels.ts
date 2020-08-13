import { Vec2 } from "./Vectors";

export interface ISpriteFrame {
    origin: Vec2;
    size: Vec2;
}

export interface ISpriteStorage {
    imageId: number;
    isTranslucent: boolean;
    metadata?: any;
}

export interface ISingleFrameSpriteStorage extends ISpriteStorage {
    frame: ISpriteFrame
}

export interface IMultiFrameSpriteStorage extends ISpriteStorage {
    frames: ISpriteFrame[];
    names?: string[];
    aliases?: { [key: string]: string };
}

export const GetFrameFromMultiFrameStorage = (frameStorage: IMultiFrameSpriteStorage, frame: number | string): number => {
    if (typeof (frame) == "number") {
        if (frameStorage.frames[frame])
            return frame;
    }
    else {
        if (frameStorage.names) {
            const f = frameStorage.names.indexOf(frame)
            if (f > -1)
                return f;
            else if (frameStorage.aliases) {
                for (const alias in frameStorage.aliases) {
                    if (alias == frame) {
                        const f = frameStorage.names.indexOf(frameStorage.aliases[alias])
                        if (f > -1)
                            return f;
                    }
                }
            }
        }
    }
    return -1;
}

export interface ISpriteDefinition {
    sourceImageName: string;
    isTranslucent?: boolean;
    metadata?: any;
}

export interface ISingleFrameSpriteDefinition extends ISpriteDefinition {
    frame: ISpriteFrame;
}

export interface IMultiFrameSpriteDefinition extends ISpriteDefinition {
    frames: ISpriteFrame[];
    names?: string[];
    aliases?: { [key: string]: string };
}