import { Vec2 } from "./Vec2";
import { Util } from "../Utility";
import { EntityBase } from "../Bases/EntityBase";

export class Transform {
    private rotation: number = 0;
    position: Vec2 = new Vec2();
    scale: Vec2 = new Vec2(1, 1);

    GetRotation(): number {
        return this.rotation;
    }

    SetRotation(angle: number): void {
        this.rotation = angle;
    }

    Rotate(angle: number): void {
        this.rotation = (this.rotation + angle) % 360;
    }

    GetRotationRadian(): number {
        return this.rotation * (Math.PI / 180);
    }

    toString(): string {
        return `pos: ${this.position.toString()} | rot: ${this.rotation.toString()} | scale: ${this.scale.toString()}`;
    }

    // https://stackoverflow.com/questions/43748418/c-move-2d-point-along-angle
    MoveForward(distance: number): void {
        this.position.x += Math.cos(this.GetRotationRadian()) * distance;
        this.position.y += Math.sin(this.GetRotationRadian()) * distance;
    }

    MoveTowardsEntity(target: EntityBase, distance: number, allowOvershoot: boolean = false): void {
        this.MoveTowards(target.transform.position, distance, allowOvershoot);
    }

    MoveTowards(target: Vec2, distance: number, allowOvershoot: boolean = false): void {
        this.position = Vec2.MoveTowards(this.position, target, distance, allowOvershoot);
    }


    RotateTowardsEntity(target: EntityBase, speed: number | null = null): void {
        this.RotateTowards(target.transform.position, speed);
    }

    // Boy am I bad with math.
    // https://answers.unity.com/questions/650460/rotating-a-2d-sprite-to-face-a-target-on-a-single.html
    RotateTowards(target: Vec2, speed: number | null = null): void {
        // Do nothing if speed is 0.
        if (speed === 0 || (this.position.x == target.x && this.position.y == target.y))
            return;

        // Get the value representing the target angle. Return it if the speed parameter was not passed.
        let targetAngle = Util.ToAngle(Math.atan2(target.y - this.position.y, target.x - this.position.x));
        if (!speed)
            this.SetRotation(targetAngle);

        // Target angle will be between 0 and -180 if the target is above the origin. This changes that to a range between 0 and 360.
        if (targetAngle < 0) targetAngle += 360;

        // Get the delta
        let angleDelta = targetAngle - this.GetRotation();

        // If the delta is 0, do nothing.
        if (angleDelta == 0) return;

        // Sometimes rotating counter-clockwise is faster, check if thats the case and update the delta
        if (angleDelta > Math.abs(angleDelta - 360)) angleDelta -= 360;

        // Apply speed constraint.
        if (angleDelta < 0)
            angleDelta = angleDelta < -speed ? -speed : angleDelta;
        else
            angleDelta = angleDelta > speed ? speed : angleDelta;

        this.SetRotation(this.GetRotation() + angleDelta);
    }
}