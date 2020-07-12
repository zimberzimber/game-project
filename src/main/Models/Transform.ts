import { Vec2 } from "./Vectors";
import { ScalarUtil } from "../Utility/Scalar";
import { Vec2Utils } from "../Utility/Vec2";
import { IObserver, Observable } from "./Observable";

export interface ITransformObserver extends IObserver<ITransformEventArgs> {
    OnObservableNotified(args: ITransformEventArgs): void;
}

export interface ITransformEventArgs {
    position?: { old: Vec2, new: Vec2 }
    rotation?: { old: number, new: number }
    scale?: { old: Vec2, new: Vec2 }
    depth?: { old: number, new: number }
}

export class Transform extends Observable<ITransformObserver, ITransformEventArgs> {
    private _position: Vec2 = [0, 0];
    get Position(): Vec2 { return Vec2Utils.Copy(this._position); }
    set Position(position: Vec2) {
        if (Vec2Utils.Equals(this._position, position)) return;
        const old = Vec2Utils.Copy(this._position);
        this._position = Vec2Utils.Copy(position);
        this.Notify({ position: { old, new: Vec2Utils.Copy(position) } });
    }

    private _depth: number = 0;
    get Depth(): number { return this._depth; }
    set Depth(depth: number) {
        if (this._depth == depth) return;
        const old = this._depth;
        this._depth = depth;
        this.Notify({ depth: { old, new: depth } });
    }

    private _scale: Vec2 = [1, 1];
    get Scale(): Vec2 { return Vec2Utils.Copy(this._scale); }
    set Scale(scale: Vec2) {
        if (Vec2Utils.Equals(this._scale, scale)) return;
        const old = Vec2Utils.Copy(this._scale);
        this._scale = Vec2Utils.Copy(scale);
        this.Notify({ scale: { old, new: Vec2Utils.Copy(scale) } });
    }

    private _rotation: number = 0;
    get Rotation(): number { return this._rotation; }
    set Rotation(angle: number) {
        if (this._rotation == angle) return;
        const old = this._rotation;
        this._rotation = angle % 360;
        this.Notify({ rotation: { old, new: this._rotation } });
    };

    get RotationRadian(): number { return ScalarUtil.ToRadian(this._rotation); }

    /** Update multiple transform fields. Use this when changing multiple fields to prevent multiple redundant observer notifications.
     * @param position New position, or null to remain unchanged
     * @param rotation New rotation, or null to remain unchanged
     * @param scale New scale, or null to remain unchanged
     * @param depth New depth, or null to remain unchanged
     */
    SetTransformParams(position: Vec2 | null, rotation: number | null, scale: Vec2 | null, depth: number | null): void {
        const args: ITransformEventArgs = {};

        if (position !== null && !Vec2Utils.Equals(this._position, position)) {
            args.position = { old: Vec2Utils.Copy(this._position), new: Vec2Utils.Copy(position) };
            this._position = Vec2Utils.Copy(position);
        }

        if (rotation !== null && rotation != this._rotation) {
            args.rotation = { old: this._rotation, new: rotation % 360 };
            this._rotation = rotation % 360;
        }

        if (scale !== null && !Vec2Utils.Equals(this._scale, scale)) {
            args.scale = { old: Vec2Utils.Copy(this._scale), new: Vec2Utils.Copy(scale) };
            this._scale = Vec2Utils.Copy(scale);
        }

        if (depth !== null && depth != this._depth) {
            args.depth = { old: this._depth, new: depth };
            this._depth = depth;
        }

        if (Object.keys(args).length > 0)
            this.Notify(args);
    }

    Rotate = (angle: number): void => {
        this.Rotation = (this._rotation + angle) % 360;
    };

    Translate = (x: number, y: number): void => {
        this.Position = [this.Position[0] + x, this.Position[1] + y];
    };

    TranslateByVec2 = (vec2: Vec2): void => {
        this.Position = Vec2Utils.Sum(this.Position, vec2);
    };

    // https://stackoverflow.com/questions/43748418/c-move-2d-point-along-angle
    MoveForward = (distance: number): void => {
        const rad = this.RotationRadian;
        this.Position = [this._position[0] = Math.cos(rad) * distance, this._position[1] = Math.sin(rad) * distance];
    }

    MoveTowards = (target: Vec2, distance: number, allowOvershoot: boolean = false): void => {
        this.Position = Vec2Utils.MoveTowards(this._position, target, distance, allowOvershoot);
    }

    // Boy am I bad with math.
    // https://answers.unity.com/questions/650460/rotating-a-2d-sprite-to-face-a-target-on-a-single.html
    RotateTowards(target: Vec2, speed: number | undefined = undefined): void {
        // Do nothing if speed is 0 or the entity is on top of the target.
        if (speed === 0 || (this._position[0] == target[0] && this._position[1] == target[1]))
            return;

        // Get the value representing the target angle.
        let targetAngle = ScalarUtil.ToAngle(Math.atan2(target[1] - this._position[1], target[0] - this._position[0]));

        // Set the rotation to the target angle, and return if no speed was passed.
        if (!speed) {
            this.Rotation = targetAngle;
            return;
        }

        // Target angle will be between 0 and -180 if the target is above the origin. This changes that to a range between 0 and 360.
        if (targetAngle < 0) targetAngle += 360;

        // Get the delta.
        let angleDelta = targetAngle - this._rotation;

        // If the delta is 0, do nothing.
        if (angleDelta == 0) return;

        // Counter-clockwise may have a smaller delta, check if thats the case and update the delta.
        if (angleDelta > Math.abs(angleDelta - 360)) angleDelta -= 360;

        // Apply speed constraint.
        if (angleDelta < 0)
            angleDelta = angleDelta < -speed ? -speed : angleDelta;
        else
            angleDelta = angleDelta > speed ? speed : angleDelta;

        this.Rotation += angleDelta;
    }

    toString = (): string => `pos: ${this._position} | rot: ${this._rotation} | scale: ${this._scale} | depth: ${this._depth}`;

    /** Get a transform thats the result of having the Operator being relative to the Subject
     * @param subject Subject transform
     * @param operator Operator transform
     */
    static TranformByTransform(subject: Transform, operator: Transform): Transform {
        const result = new Transform();

        const scaled = Vec2Utils.Mult(subject._position, operator._scale);
        const rotated = Vec2Utils.RotatePoint(scaled, operator.RotationRadian);
        result._position = Vec2Utils.Sum(rotated, operator._position);

        result.Rotation = subject._rotation + operator._rotation;
        result._scale = Vec2Utils.Mult(subject._scale, operator._scale);
        result._depth = subject._depth + operator._depth;

        return result;
    }

    static Copy(original: Transform): Transform {
        const copy = new Transform();
        copy._position = Vec2Utils.Copy(original._position);
        copy._rotation = original._rotation;
        copy._scale = Vec2Utils.Copy(original._scale);
        copy._depth = original._depth;

        return copy;
    }
}