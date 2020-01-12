import { Util } from "../Utility";

export class Vec2 {
    x: number;
    y: number;

    constructor(x: number = 0, y: number = 0) {
        this.x = x;
        this.y = y;
    }

    Set(x: number, y: number): void {
        this.x = x;
        this.y = y;
    }

    Transform(x: number, y: number): void {
        this.x += x;
        this.y += y;
    }

    TransformByVec(vec: Vec2): void {
        this.x += vec.x;
        this.y += vec.y;
    }

    toString(): string {
        return `{${this.x}, ${this.y}}`;
    }

    // Get the normalized vector for the subject vector
    static Normalized(subject: Vec2): Vec2 {
        let normalized: Vec2 = new Vec2(subject.x, subject.y);

        if (normalized.x != 0 && normalized.y != 0) {
            let third = Math.sqrt(normalized.x * normalized.x + normalized.y * normalized.y);
            normalized.x = normalized.x / third;
            normalized.y = normalized.y / third;
        }

        return normalized;
    }

    // Get the result of multiplying a vector by a scalar
    static Multiply(vec: Vec2, multiplier: number): Vec2 {
        return new Vec2(vec.x * multiplier, vec.y * multiplier);
    }

    // Get a sum of a vector and two scalars
    static SumVectorScalar(vec: Vec2, x: number, y: number) {
        return new Vec2(vec.x + x, vec.y + y);
    }

    // Get a sum of two vectors
    static SumVectors(vec1: Vec2, vec2: Vec2): Vec2 {
        return new Vec2(vec1.x + vec2.x, vec1.y + vec2.y);
    }

    // Get the difference of a vector and two scalars
    static SubVectorScalar(vec: Vec2, x: number, y: number) {
        return new Vec2(vec.x - x, vec.y - y);
    }

    // Get the difference of two vectors
    static SubVectors(vec1: Vec2, vec2: Vec2): Vec2 {
        return new Vec2(vec1.x - vec2.x, vec1.y - vec2.y);
    }

    // Get a vector representing the result of moving the origin towards the target a set distance.
    static MoveTowards(origin: Vec2, target: Vec2, distance: number, allowOvershoot: boolean = false): Vec2 {
        const returned = new Vec2(origin.x, origin.y);

        if (distance == 0) return returned;

        const distanceToPoint = Util.GetDistance(origin, target);
        if (distanceToPoint == 0 && !allowOvershoot) return returned;

        if (!allowOvershoot)
            distance = distanceToPoint < distance ? distanceToPoint : distance;

        const dirX = target.x - origin.x;
        const dirY = target.y - origin.y;
        const third = Math.sqrt(dirX * dirX + dirY * dirY);

        returned.x = origin.x + dirX / third * distance;
        returned.y = origin.y + dirY / third * distance;

        return returned;
    }
}
