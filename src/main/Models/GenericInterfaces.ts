import { Vec2 } from "./Vectors";
import { EntityBase } from "../Entities/EntityBase";

export interface IDataOrErrorContainer {
    error: Error | undefined;
    data: any | undefined;
}

export interface IComparingMethod<T> { (val1: T, val2: T): 0 | 1 | -1; }

export enum HorizontalAlignment { Left, Middle, Right }
export enum VerticalAlignment { Top, Middle, Bottom }
export interface IAlignmentContainer {
    horizontal: HorizontalAlignment;
    vertical: VerticalAlignment;
}

export interface IDebugDrawable {
    readonly DebugDrawData: number[] | null;
}
export function IsDebugDrawable(arg: any): arg is IDebugDrawable {
    // Not doing a type check within the array as it can get really heavy, and unlikely to happen
    return arg && (arg.DebugDrawData === null || Array.isArray(arg.DebugDrawData));
}

export const DebugDrawColors = Object.freeze({
    Default: [1, 1, 1],
    Hitbox: [1, 1, 0],
    HitboxTrigger: [1, 0, 0],
});