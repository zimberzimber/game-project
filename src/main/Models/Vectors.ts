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