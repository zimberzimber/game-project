import { Vec2 } from "../Models/Vec2";

export class Vec2Utils {
    static Translate = (v: Vec2, x: number, y: number): Vec2 => [v[0] + x, v[1] + y];
    static Sum = (v1: Vec2, v2: Vec2): Vec2 => [v1[0] + v2[0], v1[1] + v2[1]];
    static Sub = (v1: Vec2, v2: Vec2): Vec2 => [v1[0] - v2[0], v1[1] - v2[1]];
    static Mult = (v1: Vec2, v2: Vec2): Vec2 => [v1[0] * v2[0], v1[1] * v2[1]];
    static Div = (v1: Vec2, v2: Vec2): Vec2 => [v1[0] / v2[0], v1[1] / v2[1]];

    static SumS = (v: Vec2, num: number): Vec2 => [v[0] + num, v[1] + num];
    static SubS = (v: Vec2, num: number): Vec2 => [v[0] - num, v[1] - num];
    static MultS = (v: Vec2, num: number): Vec2 => [v[0] * num, v[1] * num];
    static DivS = (v: Vec2, num: number): Vec2 => [v[0] / num, v[1] / num];

    static Normalize = (v: Vec2): Vec2 => {
        if (!v[0] || !v[1]) return v;
        const third: number = Math.sqrt(v[0] * v[0] + v[1] * v[1]);
        return [v[0] / third, v[1] / third];
    }

    static Distance = (origin: Vec2, target: Vec2): number => Math.abs(Math.sqrt(Math.pow(target[0] - origin[0], 2) + Math.pow(target[1] - origin[1], 2)));
    static DistanceFrom00 = (origin: Vec2): number => Math.abs(Math.sqrt(Math.pow(origin[0], 2) + Math.pow(origin[1], 2)));

    static MoveTowards = (origin: Vec2, target: Vec2, distance: number, allowOvershoot: boolean = false): Vec2 => {
        if (distance == 0) return [origin[0], origin[1]];

        const distanceToPoint: number = Vec2Utils.Distance(origin, target);
        if (distanceToPoint == 0 && !allowOvershoot)
            return [origin[0], origin[1]];

        if (!allowOvershoot)
            distance = distanceToPoint < distance ? distanceToPoint : distance;

        const dirX = target[0] - origin[0];
        const dirY = target[1] - origin[1];
        const third = Math.sqrt(dirX * dirX + dirY * dirY);

        return [origin[0] + dirX / third * distance, origin[1] + dirY / third * distance];
    }

    // https://www.gamefromscratch.com/post/2012/11/24/GameDev-math-recipes-Rotating-one-point-around-another-point.aspx
    static RotatePointAroundCenter = (point: Vec2, radian: number, center: Vec2): Vec2 =>
        [
            Math.cos(-radian) * (point[0] - center[0]) - Math.sin(-radian) * (point[1] - center[1]) + center[0],
            Math.sin(-radian) * (point[0] - center[0]) + Math.cos(-radian) * (point[1] - center[1]) + center[1]
        ];

    // Derived from the RotatePointAroundCenter method
    static RotatePoint = (point: Vec2, radian: number): Vec2 => {
        if (radian == 0) return point;
        return [
            Math.cos(-radian) * point[0] - Math.sin(-radian) * point[1],
            Math.sin(-radian) * point[0] + Math.cos(-radian) * point[1],
        ];
    }
}