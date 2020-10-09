export interface Vec2 extends Array<number> {
    0: number;
    1: number;
}

export interface Vec3 extends Vec2 {
    2: number;
}

export interface Vec4 extends Vec3 {
    3: number;
}

export function IsVec2(arg: any): arg is Vec2 {
    return arg && Array.isArray(arg) && arg.length >= 2 && typeof arg[0] == 'number' && typeof arg[1] == 'number';
}
export function IsVec3(arg: any): arg is Vec3 {
    return IsVec2(arg) && arg.length >= 3 && typeof arg[2] == 'number';
}
export function IsVec4(arg: any): arg is Vec4 {
    return IsVec3(arg) && arg.length >= 4 && typeof arg[3] == 'number';
}