import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { HitboxRectangle } from "../Components/Hitboxes/HitboxRectangle";
import { HitboxCircle } from "../Components/Hitboxes/HitboxCircle";
import { HitboxPolygon } from "../Components/Hitboxes/HitboxPolygon";
import { Vec2 } from "../Models/Vec2";
import { Vec2Utils } from "../Utility/Vec2";
import { ScalarUtil } from "../Utility/Scalar";

// Dictionary storing colission methods for easier organization.
// [collider class name]: { [collider class name] : [method name] }
// Not defining a relation here will have them never collide
const MethodDictionary: { [key: string]: { [key: string]: Function } } = {
    HitboxRectangle: {
        HitboxRectangle: Rectangle_Rectangle,
        HitboxCircle: Rectangle_Circle,
        HitboxPolygon: Rectangle_Polygon,
    },
    HitboxCircle: {
        HitboxCircle: Circle_Circle,
        HitboxPolygon: Circle_Polygon
    },
    HitboxPolygon: {
        HitboxPolygon: Polygon_Polygon
    }
};

export function CheckCollision(trigger: HitboxBase, collider: HitboxBase): boolean {
    if (!IsInCollisionRange(trigger, collider))
        return false;

    // Check for a method in [trigger][collider]
    //@ts-ignore
    if (MethodDictionary[trigger.constructor.name][collider.constructor.name])
        //@ts-ignore
        if (MethodDictionary[trigger.constructor.name][collider.constructor.name](trigger, collider))
            return true

    // Check for a method in [collider][trigger]
    //@ts-ignore
    if (MethodDictionary[collider.constructor.name][trigger.constructor.name])
        //@ts-ignore
        if (MethodDictionary[collider.constructor.name][trigger.constructor.name](collider, trigger))
            return true

    return false;
}


// Initial check - Checks whether the distance between the two colliders is small enough to before performing more complex checks
// Basically checks if the distance between the center of two colliders is not greater than the sum of their HitboxOverallRadius
function IsInCollisionRange(a: HitboxBase, b: HitboxBase): boolean {
    const aTrans = a.Parent.worldRelativeTransform;
    const bTrans = b.Parent.worldRelativeTransform;
    const distance = Vec2Utils.Distance(aTrans.Position, bTrans.Position);
    return distance <= a._hitboxOverallRadius * Math.max(aTrans.Scale[0], aTrans.Scale[1]) + b._hitboxOverallRadius * Math.max(bTrans.Scale[0], bTrans.Scale[1]);
}

// Checks if the given point is inside the given polygon
function IsPointInPolygon(point: Vec2, polyline: Vec2[]): boolean {
    if (polyline.length < 3)
        return false;

    let intersections = 0;

    for (let i = 0; i < polyline.length; i++)
        // Thats the max safe integer. No idea why TS doesn't recognize it.
        if (LineIntersection(point, [point[0], 9007199254740991], polyline[i], polyline[(i + 1) % polyline.length]))
            intersections++;

    if (intersections % 2 == 1)
        return true;
    return false;
}

// https://stackoverflow.com/questions/9043805/test-if-two-lines-intersect-javascript-function
function LineIntersection(line1start: Vec2, line1end: Vec2, line2start: Vec2, line2end: Vec2): boolean {
    const det = (line1end[0] - line1start[0]) * (line2end[1] - line2start[1]) - (line2end[0] - line2start[0]) * (line1end[1] - line1start[1]);
    if (det == 0) return false;

    const lambda = ((line2end[1] - line2start[1]) * (line2end[0] - line1start[0]) + (line2start[0] - line2end[0]) * (line2end[1] - line1start[1])) / det;
    const gamma = ((line1start[1] - line1end[1]) * (line2end[0] - line1start[0]) + (line1end[0] - line1start[0]) * (line2end[1] - line1start[1])) / det;
    return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
};

// Checks is two polygons have intersecting lines
function DoPolygonsIntersect(p1: Vec2[], p2: Vec2[]): boolean {
    for (let i = 0; i < p1.length; i++)
        for (let j = 0; j < p2.length; j++)
            if (LineIntersection(p1[i], p1[(i + 1) % p1.length], p2[j], p2[(j + 1) % p2.length]))
                return true;
    return false;
}




// Rectangle vs Rectangle, Circle, Polygon 
function Rectangle_Rectangle(a: HitboxRectangle, b: HitboxRectangle): boolean {
    const aTrans = a.Parent.worldRelativeTransform;
    const bTrans = b.Parent.worldRelativeTransform;

    const aw = a.Width / 2 * aTrans.Scale[0];
    const ah = a.Height / 2 * aTrans.Scale[1];
    const aPolyline = [
        Vec2Utils.Translate(aTrans.Position, aw, ah),
        Vec2Utils.Translate(aTrans.Position, aw, -ah),
        Vec2Utils.Translate(aTrans.Position, -aw, -ah),
        Vec2Utils.Translate(aTrans.Position, -aw, ah)
    ];

    const bw = b.Width / 2 * bTrans.Scale[0];
    const bh = b.Height / 2 * bTrans.Scale[1];
    const bPolyline = [
        Vec2Utils.Translate(bTrans.Position, bw, bh),
        Vec2Utils.Translate(bTrans.Position, bw, -bh),
        Vec2Utils.Translate(bTrans.Position, -bw, -bh),
        Vec2Utils.Translate(bTrans.Position, -bw, bh)
    ];

    // Most cases will occur through edge intersection
    if (DoPolygonsIntersect(aPolyline, bPolyline)) return true;

    // Only other option is when one of the colliders is entirely within another
    // in which case checking if their center is inside is enough
    if (IsPointInPolygon(aTrans.Position, bPolyline)) return true;
    if (IsPointInPolygon(bTrans.Position, aPolyline)) return true;

    return false;
}

function Rectangle_Circle(a: HitboxRectangle, b: HitboxCircle): boolean {
    const aTrans = a.Parent.worldRelativeTransform;
    const bTrans = b.Parent.worldRelativeTransform;

    const aw = a.Width * aTrans.Scale[0] / 2;
    const ah = a.Height * aTrans.Scale[1] / 2;
    const bRad = (bTrans.Scale[0] + bTrans.Scale[1]) / 2 * b.Radius;

    const aPolyline = [
        Vec2Utils.Translate(aTrans.Position, aw, ah),
        Vec2Utils.Translate(aTrans.Position, -aw, ah),
        Vec2Utils.Translate(aTrans.Position, -aw, -ah),
        Vec2Utils.Translate(aTrans.Position, aw, -ah),
    ];

    // Check if any of the rectangles corners is inside the circle
    for (let i = 0; i < 4; i++)
        if (Vec2Utils.Distance(aPolyline[i], bTrans.Position) <= bRad) return true;

    // Under certain circumstances the circle may be colliding with the rectangle without having a corned inside of it
    // Checking the 4 cardinal directions does the trick
    const bPolyline = [
        Vec2Utils.Translate(bTrans.Position, 0, bRad),
        Vec2Utils.Translate(bTrans.Position, -bRad, 0),
        Vec2Utils.Translate(bTrans.Position, 0, -bRad),
        Vec2Utils.Translate(bTrans.Position, bRad, 0),
    ]

    for (let i = 0; i < 4; i++)
        if (IsPointInPolygon(bPolyline[i], aPolyline)) return true;

    return false;
}

function Rectangle_Polygon(a: HitboxRectangle, b: HitboxPolygon): boolean {
    const aTrans = a.Parent.worldRelativeTransform;
    const bTrans = b.Parent.worldRelativeTransform;

    const aw = a.Width / 2 * aTrans.Scale[0];
    const ah = a.Height / 2 * aTrans.Scale[1];
    const bPolyline = b.CanvasReletivePolyline;

    const aPolyline = [
        Vec2Utils.Translate(aTrans.Position, aw, ah),
        Vec2Utils.Translate(aTrans.Position, aw, -ah),
        Vec2Utils.Translate(aTrans.Position, -aw, -ah),
        Vec2Utils.Translate(aTrans.Position, -aw, ah)
    ];

    // Check if the polylines intersect, and if one is fully immersed inside the other
    if (DoPolygonsIntersect(aPolyline, bPolyline)) return true;
    if (IsPointInPolygon(aTrans.Position, bPolyline)) return true;
    if (IsPointInPolygon(bTrans.Position, aPolyline)) return true;

    return false;
}

// Circle vs Circle, Polygon
function Circle_Circle(a: HitboxCircle, b: HitboxCircle): boolean {
    const aTrans = a.Parent.worldRelativeTransform;
    const bTrans = b.Parent.worldRelativeTransform;
    const collisionDistance = (aTrans.Scale[0] + aTrans.Scale[1]) / 2 * a.Radius + (bTrans.Scale[0] + bTrans.Scale[1]) / 2 * b.Radius;
    return Vec2Utils.Distance(aTrans.Position, bTrans.Position) <= collisionDistance;
}

function Circle_Polygon(a: HitboxCircle, b: HitboxPolygon): boolean {
    const polyline = b.CanvasReletivePolyline;
    const aTrans = a.Parent.worldRelativeTransform;

    // Check if the center of the circle is inside the polygon, as the only uncovered case further down is that the circle is fully inside the polygon
    if (IsPointInPolygon(aTrans.Position, polyline)) return true;

    // Create lines between the center of the circle and points on the perimeter, and polygon lines.
    // Should cover all cases except very unlikely cases where the intersection falls on skipped angles (as I'm not covering all 360 angles)
    // The bigger the circle and the smaller the intersection the more likely it is to happen
    const tPoint = Vec2Utils.Translate(aTrans.Position, 0, (aTrans.Scale[0] + aTrans.Scale[1]) / 2 * a.Radius);
    for (let i = 0; i < 360; i += 4) {
        const rotated = Vec2Utils.RotatePointAroundCenter(tPoint, ScalarUtil.ToRadian(i), aTrans.Position);
        for (let j = 0; j < polyline.length; j++)
            if (LineIntersection(aTrans.Position, rotated, polyline[j], polyline[(j + 1) % polyline.length]))
                return true;
    }

    return false;
}

// Polygon vs Polygon
function Polygon_Polygon(a: HitboxPolygon, b: HitboxPolygon): boolean {
    const aPolyline = a.CanvasReletivePolyline;
    const bPolyline = b.CanvasReletivePolyline;

    // Check if any of the polygon lines intersect
    if (DoPolygonsIntersect(aPolyline, bPolyline)) return true;

    // Check for full immerssion
    const aTrans = a.Parent.worldRelativeTransform;
    const bTrans = b.Parent.worldRelativeTransform;
    if (IsPointInPolygon(aPolyline[0], bPolyline)) return true;
    if (IsPointInPolygon(bPolyline[0], aPolyline)) return true;

    return false;
}