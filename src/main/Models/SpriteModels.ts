export interface ISpriteFrame {
    origin: [number, number];
    size: [number, number];
}

export interface ISpriteStorage {
    imageId: number;
}

export interface ISingleFrameSpriteStorage extends ISpriteStorage {
    frame: ISpriteFrame
}

export interface IMultiFrameSpriteStorage extends ISpriteStorage {
    frames: ISpriteFrame[];
    names?: string[];
    aliases?: { [key: string]: string };
}


export interface ISpriteDefinition {
    sourceImageName: string;
}

export interface ISingleFrameSpriteDefinition extends ISpriteDefinition {
    frame: ISpriteFrame;
}

export interface IMultiFrameSpriteDefinition extends ISpriteDefinition {
    frames: ISpriteFrame[];
    names?: string[];
    aliases?: { [key: string]: string };
}