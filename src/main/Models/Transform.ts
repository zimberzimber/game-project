import { Vec2 } from "./Vec2";
import { ScalarUtil } from "../Utility/Scalar";
import { Vec2Utils } from "../Utility/Vec2";

export class Transform {
    private rotation: number = 0;
    position: Vec2 = [0, 0];
    scale: Vec2 = [1, 1];

    GetRotation = (): number => this.rotation;
    SetRotation = (angle: number): void => { this.rotation = angle % 360; };
    Rotate = (angle: number): void => { this.rotation = (this.rotation + angle) % 360; };

    GetRotationRadian = (): number => ScalarUtil.ToRadian(this.rotation);

    toString = (): string => `pos: ${this.position} | rot: ${this.rotation} | scale: ${this.scale}`;

    // https://stackoverflow.com/questions/43748418/c-move-2d-point-along-angle
    MoveForward = (distance: number): void => {
        const rad = this.GetRotationRadian();
        this.position[0] += Math.cos(rad) * distance;
        this.position[1] += Math.sin(rad) * distance;
    }

    MoveTowards = (target: Vec2, distance: number, allowOvershoot: boolean = false): void => {
        this.position = Vec2Utils.MoveTowards(this.position, target, distance, allowOvershoot);
    }

    // Boy am I bad with math.
    // https://answers.unity.com/questions/650460/rotating-a-2d-sprite-to-face-a-target-on-a-single.html
    RotateTowards(target: Vec2, speed: number | undefined = undefined): void {

        // Do nothing if speed is 0 or the entity is on top of the target.
        if (speed === 0 || (this.position[0] == target[0] && this.position[1] == target[1]))
            return;

        // Get the value representing the target angle.
        let targetAngle = ScalarUtil.ToAngle(Math.atan2(target[1] - this.position[1], target[0] - this.position[0]));

        // Set the rotation to the target angle, and return if no speed was passed.
        if (!speed) {
            this.SetRotation(targetAngle);
            return;
        }

        // Target angle will be between 0 and -180 if the target is above the origin. This changes that to a range between 0 and 360.
        if (targetAngle < 0) targetAngle += 360;

        // Get the delta.
        let angleDelta = targetAngle - this.rotation;

        // If the delta is 0, do nothing.
        if (angleDelta == 0) return;

        // Counter-clockwise may have a smaller delta, check if thats the case and update the delta.
        if (angleDelta > Math.abs(angleDelta - 360)) angleDelta -= 360;

        // Apply speed constraint.
        if (angleDelta < 0)
            angleDelta = angleDelta < -speed ? -speed : angleDelta;
        else
            angleDelta = angleDelta > speed ? speed : angleDelta;

        this.SetRotation(this.rotation + angleDelta);
    }

    static TranformByTransform(subject: Transform, operator: Transform): Transform {
        const result = new Transform();

        const scaled = Vec2Utils.Mult(subject.position, operator.scale);
        const rotated = Vec2Utils.RotatePoint(scaled, operator.GetRotationRadian());
        result.position = Vec2Utils.Sum(rotated, operator.position);

        result.SetRotation(subject.rotation + operator.rotation);
        result.scale = Vec2Utils.Mult(subject.scale, operator.scale);
        return result;
    }
}