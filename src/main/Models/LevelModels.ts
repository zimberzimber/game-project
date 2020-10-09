import { GameEntityBase } from "../Entities/EntityBase";
import { VerticalAlignment } from "./GenericInterfaces";
import { Vec2, Vec3 } from "./Vectors";

interface ILevelEntityContainer {
    entityType: any; // TypeScript is not capable of checking whether a type is a child to another type, so going with this + an utility method
    contructorArgs?: any[];
    position?: Vec2;
    rotation?: number;
    scale?: Vec2;
    depth?: number;
}

export interface IBackgroundControllerConfig {
    back: IBackgroundControllerSubConfig[];
    front: IBackgroundControllerSubConfig[];
    backDepthOffset: number;
    frontDepthOffset: number;
    length: number;
    globalLight?: Vec3;
}

interface IBackgroundControllerSubConfig {
    imageName: string;
    tileWidth: number;
    height: number;
    scrollSpeed: number;
    verticalAlignment?: VerticalAlignment;
    scrollOverLength?: number
}

export interface ILevelDef {
    length: number;
    speed: number;
    music?: string;
    reverb?: string;
    bgConfig: IBackgroundControllerConfig;
    entities: ILevelEntityContainer[];
}