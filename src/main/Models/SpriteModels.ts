export interface ISpriteFrame {
    origin: [number, number];
    size: [number, number];
}

export interface ISPriteData extends ISpriteFrame {
    imageId: number;
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