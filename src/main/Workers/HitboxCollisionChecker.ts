import { HitboxBase } from "../Bases/HitboxBase";
import { HitboxType } from "../Models/HitboxType";
import { HitboxRectangle } from "../Components/HitboxRectangle";
import { HitboxCircle } from "../Components/HitboxCircle";
import { HitboxPolygon } from "../Components/HitboxPolygon";
import Vec2 from "../Models/Vec2";
import Vec2Utils from "../Utility/Vec2";

const HELPER_POINT_X_OFFSET: number = 100;

// This makes me sad
export default function CheckCollision(trigger: HitboxBase, collision: HitboxBase): boolean {
    if (!IsInCollisionRange(trigger, collision))
        return false;

    switch (trigger.HitboxType) {
        case HitboxType.Rectangular:
            switch (collision.HitboxType) {
                case HitboxType.Rectangular:
                    return Rectangle_Rectangle(trigger as HitboxRectangle, collision as HitboxRectangle);

                case HitboxType.Circular:
                    return Rectangle_Circle(trigger as HitboxRectangle, collision as HitboxCircle);

                case HitboxType.Polygonal:
                    return Rectangle_Polygon(trigger as HitboxRectangle, collision as HitboxPolygon);
            }
            break;

        case HitboxType.Circular:
            switch (collision.HitboxType) {
                case HitboxType.Rectangular:
                    return Rectangle_Circle(collision as HitboxRectangle, trigger as HitboxCircle);

                case HitboxType.Circular:
                    return Circle_Circle(trigger as HitboxCircle, collision as HitboxCircle);

                case HitboxType.Polygonal:
                    return Circle_Polygon(trigger as HitboxCircle, collision as HitboxPolygon);
            }
            break;

        case HitboxType.Polygonal:
            switch (collision.HitboxType) {
                case HitboxType.Rectangular:
                    return Rectangle_Polygon(collision as HitboxRectangle, trigger as HitboxPolygon);

                case HitboxType.Circular:
                    return Circle_Polygon(collision as HitboxCircle, trigger as HitboxPolygon);

                case HitboxType.Polygonal:
                    return Polygon_Polygon(trigger as HitboxPolygon, collision as HitboxPolygon);
            }
            break;
    }

    return false;
}

// Initial check - Checks whether the distance between the two colliders is small enough to before performing more complex checks
// Basically checks if the distance between the center of two colliders is not greater than the sum of their HitboxOverallRadius
function IsInCollisionRange(a: HitboxBase, b: HitboxBase): boolean {
    const aTrans = a.parent.GetWorldRelativeTransform();
    const bTrans = b.parent.GetWorldRelativeTransform();
    const distance = Vec2Utils.Distance(aTrans.position, bTrans.position);
    return distance <= a.HitboxOverallRadius * Math.max(aTrans.scale[0], aTrans.scale[1]) + b.HitboxOverallRadius * Math.max(bTrans.scale[0], bTrans.scale[1]);
}

function IsPointInPolygon(point: Vec2, polyline: Vec2[]): boolean {
    if (polyline.length < 3)
        return false;

    let intersections = 0;

    for (let i = 0; i < polyline.length; i++)
        if (LineIntersection(point, Vec2Utils.Transform(point, HELPER_POINT_X_OFFSET, 0), polyline[i], polyline[(i + 1) % polyline.length]))
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

// Rectangle vs Rectangle, Circle, Polygon 
function Rectangle_Rectangle(a: HitboxRectangle, b: HitboxRectangle): boolean {
    const wA = a.GetWidth() / 2;
    const hA = a.GetHeight() / 2;

    const wB = b.GetWidth() / 2;
    const hB = b.GetHeight() / 2;

    const aPoint1 = Vec2Utils.Transform(a.parent.transform.position, wA, hA);
    const aPoint2 = Vec2Utils.Transform(a.parent.transform.position, wA, -hA);
    const aPoint3 = Vec2Utils.Transform(a.parent.transform.position, -wA, -hA);
    const aPoint4 = Vec2Utils.Transform(a.parent.transform.position, -wA, hA);
    const aPolyline = [aPoint1, aPoint2, aPoint3, aPoint4];

    const bPoint1 = Vec2Utils.Transform(b.parent.transform.position, wB, hB);
    const bPoint2 = Vec2Utils.Transform(b.parent.transform.position, wB, -hB);
    const bPoint3 = Vec2Utils.Transform(b.parent.transform.position, -wB, -hB);
    const bPoint4 = Vec2Utils.Transform(b.parent.transform.position, -wB, hB);
    const bPolyline = [bPoint1, bPoint2, bPoint3, bPoint4];

    if (IsPointInPolygon(aPoint1, bPolyline)) return true;
    if (IsPointInPolygon(aPoint2, bPolyline)) return true;
    if (IsPointInPolygon(aPoint3, bPolyline)) return true;
    if (IsPointInPolygon(aPoint4, bPolyline)) return true;

    if (IsPointInPolygon(bPoint1, aPolyline)) return true;
    if (IsPointInPolygon(bPoint2, aPolyline)) return true;
    if (IsPointInPolygon(bPoint3, aPolyline)) return true;
    if (IsPointInPolygon(bPoint4, aPolyline)) return true;

    return false;
}

function Rectangle_Circle(a: HitboxRectangle, b: HitboxCircle): boolean {
    const rw = a.GetWidth() / 2;
    const rh = a.GetHeight() / 2;
    const crad = b.GetRadius();

    const rPoint1 = Vec2Utils.Transform(a.parent.transform.position, rw, rh);
    const rPoint2 = Vec2Utils.Transform(a.parent.transform.position, rw, -rh);
    const rPoint3 = Vec2Utils.Transform(a.parent.transform.position, -rw, -rh);
    const rPoint4 = Vec2Utils.Transform(a.parent.transform.position, -rw, rh);
    const rPolyline = [rPoint1, rPoint2, rPoint3, rPoint4];

    const cPoint: Vec2 = Vec2Utils.MoveTowards(b.parent.transform.position, a.parent.transform.position, crad);
    if (IsPointInPolygon(cPoint, rPolyline)) return true;

    return false;
}

function Rectangle_Polygon(a: HitboxRectangle, b: HitboxPolygon): boolean {
    const rw = a.GetWidth() / 2;
    const rh = a.GetHeight() / 2;
    const pPolyline = b.GetCanvasReletivePolyline();

    const rPoint1 = Vec2Utils.Transform(a.parent.transform.position, rw, rh);
    const rPoint2 = Vec2Utils.Transform(a.parent.transform.position, rw, -rh);
    const rPoint3 = Vec2Utils.Transform(a.parent.transform.position, -rw, -rh);
    const rPoint4 = Vec2Utils.Transform(a.parent.transform.position, -rw, rh);

    if (IsPointInPolygon(rPoint1, pPolyline)) return true;
    if (IsPointInPolygon(rPoint2, pPolyline)) return true;
    if (IsPointInPolygon(rPoint3, pPolyline)) return true;
    if (IsPointInPolygon(rPoint4, pPolyline)) return true;

    const rPolyline = [rPoint1, rPoint2, rPoint3, rPoint4];
    for (let i = 0; i < pPolyline.length; i++)
        if (IsPointInPolygon(pPolyline[i], rPolyline)) return true;

    return false;
}

// Circle vs Circle, Polygon
function Circle_Circle(a: HitboxCircle, b: HitboxCircle): boolean {
    const aTrans = a.parent.GetWorldRelativeTransform();
    const bTrans = b.parent.GetWorldRelativeTransform();
    const collisionDistance = a.GetRadius() * ((aTrans.scale[0] + aTrans.scale[1]) / 2) + b.GetRadius() * ((bTrans.scale[0] + bTrans.scale[1]) / 2)
    return Vec2Utils.Distance(aTrans.position, bTrans.position) <= collisionDistance;
}

// This doesn't cover some edge cases... but it should... maybe one day...
function Circle_Polygon(a: HitboxCircle, b: HitboxPolygon): boolean {
    const polyline = b.GetCanvasReletivePolyline();
    const circleTransform = a.parent.GetWorldRelativeTransform();

    for (let i = 0; i < polyline.length; i++)
        if (Vec2Utils.Distance(circleTransform.position, polyline[i]) <= a.GetRadius())
            return true;

    // EDGE CASE: Polygons origin might not be inside the actual polygon
    const closestPointToPolygonOrigin = Vec2Utils.MoveTowards(circleTransform.position, b.parent.GetWorldRelativeTransform().position, a.GetRadius(), false)
    if (IsPointInPolygon(closestPointToPolygonOrigin, polyline))
        return true;

    return false;
}

// Polygon vs Polygon
function Polygon_Polygon(a: HitboxPolygon, b: HitboxPolygon): boolean {
    const aPolyline = a.GetCanvasReletivePolyline();
    const bPolyline = b.GetCanvasReletivePolyline();

    for (let i = 0; i < aPolyline.length; i++)
        if (IsPointInPolygon(aPolyline[i], bPolyline)) return true;

    for (let i = 0; i < bPolyline.length; i++)
        if (IsPointInPolygon(bPolyline[i], aPolyline)) return true;

    return false;
}