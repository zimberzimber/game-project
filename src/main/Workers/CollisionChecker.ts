import { HitboxBase } from "../Components/Hitboxes/HitboxBase";
import { HitboxRectangle } from "../Components/Hitboxes/HitboxRectangle";
import { HitboxCircle } from "../Components/Hitboxes/HitboxCircle";
import { HitboxPolygon } from "../Components/Hitboxes/HitboxPolygon";
import { Vec2 } from "../Models/Vectors";
import { Vec2Utils } from "../Utility/Vec2";
import { ScalarUtil } from "../Utility/Scalar";


// Dictionary storing colission methods.
// [collider class name]: { [collider class name] : [method name] }
// Not defining a relation here will have them never collide.
// 'Point' is a separate field for checking point against different hitbox types.
const MethodDictionary: { [key: string]: { [key: string]: Function } } = {
    Point: {
        HitboxRectangle: (point: Vec2, c: HitboxRectangle): boolean => {
            const cTrans = c.Parent.WorldRelativeTransform;
            if (point[0] >= cTrans.Position[0] - c.Width / 2 && point[0] <= cTrans.Position[0] + c.Width / 2
                && point[1] >= cTrans.Position[1] - c.Height / 2 && point[1] <= cTrans.Position[1] + c.Height / 2)
                return true;
            return false;
        },
        HitboxCircle: (point: Vec2, c: HitboxCircle): boolean => {
            return Vec2Utils.Distance(point, c.Parent.WorldRelativeTransform.Position) <= c.Radius;
        },
        HitboxPolygon: (point: Vec2, c: HitboxPolygon): boolean => {
            return IsPointInPolygon(point, c.CanvasReletivePolyline);
        }
    },

    HitboxRectangle: {
        HitboxRectangle: (a: HitboxRectangle, b: HitboxRectangle): boolean => {
            const aTrans = a.Parent.WorldRelativeTransform;
            const bTrans = b.Parent.WorldRelativeTransform;

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
        },
        HitboxCircle: (a: HitboxRectangle, b: HitboxCircle): boolean => {
            const aTrans = a.Parent.WorldRelativeTransform;
            const bTrans = b.Parent.WorldRelativeTransform;

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
        },
        HitboxPolygon: (a: HitboxRectangle, b: HitboxPolygon): boolean => {
            const aTrans = a.Parent.WorldRelativeTransform;
            const bTrans = b.Parent.WorldRelativeTransform;

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
        },
    },
    HitboxCircle: {
        HitboxCircle: (a: HitboxCircle, b: HitboxCircle): boolean => {
            const aTrans = a.Parent.WorldRelativeTransform;
            const bTrans = b.Parent.WorldRelativeTransform;
            const collisionDistance = (aTrans.Scale[0] + aTrans.Scale[1]) / 2 * a.Radius + (bTrans.Scale[0] + bTrans.Scale[1]) / 2 * b.Radius;
            return Vec2Utils.Distance(aTrans.Position, bTrans.Position) <= collisionDistance;
        },
        HitboxPolygon: (a: HitboxCircle, b: HitboxPolygon): boolean => {
            const polyline = b.CanvasReletivePolyline;
            const aTrans = a.Parent.WorldRelativeTransform;

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
    },
    HitboxPolygon: {
        HitboxPolygon: (a: HitboxPolygon, b: HitboxPolygon): boolean => {
            const aPolyline = a.CanvasReletivePolyline;
            const bPolyline = b.CanvasReletivePolyline;

            // Check if any of the polygon lines intersect
            if (DoPolygonsIntersect(aPolyline, bPolyline)) return true;

            // Check for full immerssion
            const aTrans = a.Parent.WorldRelativeTransform;
            const bTrans = b.Parent.WorldRelativeTransform;
            if (IsPointInPolygon(aPolyline[0], bPolyline)) return true;
            if (IsPointInPolygon(bPolyline[0], aPolyline)) return true;

            return false;
        }
    }
};

/**
 * Checks whether the passed point is within the passed hitbox.
 * @param point The point to check
 * @param hitbox Within which hitbox to check
 */
export const IsPointInCollider = (point: Vec2, hitbox: HitboxBase): boolean => {
    if (Vec2Utils.Distance(point, hitbox.Parent.WorldRelativeTransform.Position))
        if (MethodDictionary.Point[hitbox.constructor.name])
            if (MethodDictionary.Point[hitbox.constructor.name](point, hitbox))
                return true;
    return false;
}

/**
 * Checks for collision between the two passed hitboxes
 * @param hitbox1 Hitbox to check
 * @param hitbox2 The other hitbox to check
 */
export const CheckCollision = (hitbox1: HitboxBase, hitbox2: HitboxBase): boolean => {
    if (IsInCollisionRange(hitbox1, hitbox2)) {
        // Check for a method in [trigger][collider]
        if (MethodDictionary[hitbox1.constructor.name][hitbox2.constructor.name]) {
            if (MethodDictionary[hitbox1.constructor.name][hitbox2.constructor.name](hitbox1, hitbox2))
                return true
        }
        // Check for a method in [collider][trigger]
        else if (MethodDictionary[hitbox2.constructor.name][hitbox1.constructor.name]) {
            if (MethodDictionary[hitbox2.constructor.name][hitbox1.constructor.name](hitbox2, hitbox1))
                return true
        }
    }

    return false;
}

// Initial check - Checks whether the distance between the two colliders is small enough before performing more complex checks
// Basically checks if the distance between the center of two colliders is not greater than the sum of their HitboxOverallRadius
const IsInCollisionRange = (a: HitboxBase, b: HitboxBase): boolean => {
    const aTrans = a.Parent.WorldRelativeTransform;
    const bTrans = b.Parent.WorldRelativeTransform;
    const distance = Vec2Utils.Distance(aTrans.Position, bTrans.Position);
    return distance <= a.BoundingRadius * Math.max(aTrans.Scale[0], aTrans.Scale[1]) + b.BoundingRadius * Math.max(bTrans.Scale[0], bTrans.Scale[1]);
}

/**
 * Check if the point is inside the polygon
 * @param point Subject point
 * @param polyline Subject polygon
 */
export const IsPointInPolygon = (point: Vec2, polyline: Vec2[]): boolean => {
    if (polyline.length < 3)
        return false;

    let intersections = 0;

    for (let i = 0; i < polyline.length; i++)
        if (LineIntersection(point, [point[0], Number.MAX_SAFE_INTEGER], polyline[i], polyline[(i + 1) % polyline.length]))
            intersections++;

    return intersections % 2 == 1;
}

// Taken from: https://stackoverflow.com/questions/563198/how-do-you-detect-where-two-line-segments-intersect#answer-1968345
/**
 * Get the point of intersection between two lines, or null if they do not intersect.
 * @param l1p1 Line 1 start
 * @param l1p2 Line 1 end
 * @param l2p1 Line 2 start
 * @param l2p2 Line 2 end
 */
const LineIntersection = (l1p1: Vec2, l1p2: Vec2, l2p1: Vec2, l2p2: Vec2): Vec2 | null => {
    const s1: Vec2 = [l1p2[0] - l1p1[0], l1p2[1] - l1p1[1]];
    const s2: Vec2 = [l2p2[0] - l2p1[0], l2p2[1] - l2p1[1]];
    const det = -s2[0] * s1[1] + s1[0] * s2[1];

    if (det != 0) {
        const s = (-s1[1] * (l1p1[0] - l2p1[0]) + s1[0] * (l1p1[1] - l2p1[1])) / det;
        const t = (s2[0] * (l1p1[1] - l2p1[1]) - s2[1] * (l1p1[0] - l2p1[0])) / det;

        if (s >= 0 && s <= 1 && t >= 0 && t <= 1)
            return [l1p1[0] + (t * s1[0]), l1p1[1] + (t * s1[1])];
    }

    return null;
}

// Checks is two polygons have intersecting lines
const DoPolygonsIntersect = (p1: Vec2[], p2: Vec2[]): boolean => {
    for (let i = 0; i < p1.length; i++)
        for (let j = 0; j < p2.length; j++)
            if (LineIntersection(p1[i], p1[(i + 1) % p1.length], p2[j], p2[(j + 1) % p2.length]))
                return true;
    return false;
}