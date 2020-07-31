export interface IDataOrErrorContainer {
    error: Error | undefined;
    data: any | undefined;
}

export enum HorizontalAlignment { Left, Middle, Right }
export enum VerticalAlignment { Top, Middle, Bottom }
export interface IAlignmentContainer {
    horizontal: HorizontalAlignment;
    vertical: VerticalAlignment;
}