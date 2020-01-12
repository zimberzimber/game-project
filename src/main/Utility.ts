import { Vec2 } from "./Models/Vec2";
import { _G } from "./Main";

export class Util {
    static GetDistance(p1: Vec2, p2: Vec2): number {
        return Math.abs(Math.sqrt(Math.pow(p2.x - p1.x, 2) + Math.pow(p2.y - p1.y, 2)));
    }

    static GetDistanceFrom00(p: Vec2): number {
        return Math.abs(Math.sqrt(Math.pow(p.x, 2) + Math.pow(p.y, 2)));
    }

    static Shake(): number {
        return Math.random() * 2 - 1;
    }

    static FPSReletive(number: number): number {
        return number / _G.FPS;
    }

    // https://www.gamefromscratch.com/post/2012/11/24/GameDev-math-recipes-Rotating-one-point-around-another-point.aspx
    static RotatePointAroundCenter(point: Vec2, radian: number, center: Vec2): Vec2 {
        const x = Math.cos(radian) * (point.x - center.x) - Math.sin(radian) * (point.y - center.y) + center.x;
        const y = Math.sin(radian) * (point.x - center.x) + Math.cos(radian) * (point.y - center.y) + center.y;
        return new Vec2(x, y);
    }

    // Derived from the RotatePointAroundCenter method
    static RotatePoint(point: Vec2, radian: number): Vec2 {
        const x = Math.cos(radian) * point.x - Math.sin(radian) * point.y;
        const y = Math.sin(radian) * point.x + Math.cos(radian) * point.y;
        return new Vec2(x, y);
    }

    // radian = angle * (PI / 180)
    static ToRadian(angle: number): number {
        return angle * (Math.PI / 180)
    }

    // angle = radian / (PI / 180)
    static ToAngle(radian: number): number {
        return radian * (180 / Math.PI);
    }


    // IsIntersecting(hitbox: HitboxBase): boolean {
    //     if (this.Points.length < 3 || hitbox.Points.length < 3)
    //         return false;

    //     hitbox.Points.forEach(point => {
    //         let intersections = 0;

    //         for (let i = 0; i < this.Points.length; i++) {
    //             let intersecting = this.IsLineIntersecting(point, this.Points[i], this.Points[(i + 1) % this.Points.length]);
    //             if (intersecting)
    //                 intersections++;
    //         }

    //         if (intersections % 2 == 1)
    //             return true;
    //     });
    //     return false;
    // }

    // IsLineIntersecting(point: Vec2, lineP1: Vec2, lineP2: Vec2): boolean {
    //     let helperPoint = new Vec2(lineP1.x + 1, point.y);
    //     let result = this.LineIntersection(point, helperPoint, lineP1, lineP2)

    //     if (!result) return false;

    //     let inX = false;
    //     let inY = false;

    //     if (lineP1.x > lineP2.x) {
    //         if (result.x >= lineP2.x && result.x <= lineP1.x)
    //             inX = true;
    //     }
    //     else
    //         if (result.x <= lineP2.x && result.x >= lineP1.x)
    //             inX = true;

    //     if (lineP1.y > lineP2.y) {
    //         if (result.y >= lineP2.y && result.y <= lineP1.y)
    //             inY = true;
    //     }
    //     else
    //         if (result.y <= lineP2.y && result.y >= lineP1.y)
    //             inY = true;

    //     return (inX && inY);
    // }

    // LineIntersection(line1start: Vec2, line1end: Vec2, line2start: Vec2, line2end: Vec2): Vec2 {

    //     //Line1
    //     let A1 = line1end.y - line1start.y;
    //     let B1 = line1end.x - line1start.x;
    //     let C1 = A1 * line1start.x + B1 * line1start.y;

    //     //Line2
    //     let A2 = line2end.y - line2start.y;
    //     let B2 = line2end.x - line2start.x;
    //     let C2 = A2 * line2start.x + B2 * line2start.y;

    //     let delta = A1 * B2 - A2 * B1;

    //     if (delta == 0) return null;

    //     let x = (B2 * C1 - B1 * C2) / delta;
    //     let y = (A1 * C2 - A2 * C1) / delta;
    //     return new Vec2(x, y);
    // }
}