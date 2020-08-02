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