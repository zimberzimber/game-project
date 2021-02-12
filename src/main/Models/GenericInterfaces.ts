import { Vec2 } from "./Vectors";
import { EntityBase } from "../Entities/EntityBase";

export interface IDataOrErrorContainer {
    error: Error | undefined;
    data: any | undefined;
}

export interface IComparingMethod<T> { (val1: T, val2: T): 0 | 1 | -1; }

export enum HorizontalAlignment { Left = -1, Middle = 0, Right = 1 };
export enum VerticalAlignment { Top = 1, Middle = 0, Bottom = -1 };
export interface IAlignmentContainer {
    horizontal: HorizontalAlignment;
    vertical: VerticalAlignment;
}

export interface IAlignable {
    Alignment: IAlignmentContainer;
    HorizontalAlignment: HorizontalAlignment;
    VerticalAlignment: VerticalAlignment;
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

export interface IGenericCallback {
    (args?: any): any;
}


export function isDamagable(object: any): object is IDamagable {
    return object.Damage && typeof (object.Damage) == "function";
}

export interface IDamagable {
    Health: [number, number];
    Damage(damage: number): void;
    Die(): void;
}

export type ClassType<T> = Function & { prototype: T }