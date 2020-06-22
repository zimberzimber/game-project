import { Vec2 } from "./Vectors";
import { ScalarUtil } from "../Utility/Scalar";
import { Vec2Utils } from "../Utility/Vec2";
import { IObserver, Observable } from "./Observable";

export enum TransformField {
    None = 0,
    Position = 1 << 0,
    Rotation = 1 << 1,
    Scale = 1 << 2,
    Depth = 1 << 3,
    All = ~(~0 << 4)
}

export interface ITransformObserver extends IObserver<ITransformEventArgs> {
    OnObservableNotified(args: ITransformEventArgs): void;
}

export interface ITransformEventArgs {
    oldValue: number | Vec2;
    newValue: number | Vec2;
    field: TransformField;
}

export class Transform extends Observable<ITransformObserver, ITransformEventArgs> {
    private _position: Vec2 = [0, 0];
    get Position(): Vec2 { return this._position; }
    set Position(position: Vec2) {
        const old = this._position;
        this._position = position;
        this.Notify({ oldValue: old, newValue: position, field: TransformField.Position });
    }

    private _depth: number = 0;
    get Depth(): number { return this._depth; }
    set Depth(depth: number) {
        const old = this._depth;
        this._depth = depth;
        this.Notify({ oldValue: old, newValue: depth, field: TransformField.Depth });
    }

    private _scale: Vec2 = [1, 1];
    get Scale(): Vec2 { return this._scale; }
    set Scale(scale: Vec2) {
        const old = this._scale;
        this._scale = scale;
        this.Notify({ oldValue: old, newValue: scale, field: TransformField.Scale });
    }

    private _rotation: number = 0;
    get Rotation(): number { return this._rotation; }
    set Rotation(angle: number) {
        const old = this._rotation;
        this._rotation = angle % 360;
        this.Notify({ oldValue: old, newValue: this._rotation, field: TransformField.Rotation });
    };

    get RotationRadian(): number { return ScalarUtil.ToRadian(this._rotation); }

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

    toString = (): string => `pos: ${this._position} | rot: ${this._rotation} | scale: ${this._scale}`;

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
        copy._position = original._position;
        copy._rotation = original._rotation;
        copy._scale = original._scale;
        copy._depth = original._depth;

        return copy;
    }
}