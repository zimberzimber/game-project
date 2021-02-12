import { ForceComponent, GravityForceComponent } from "../../Components/Mechanics/ForceComponent";
import { TimerComponent } from "../../Components/Mechanics/TimerComponent";
import { DrawDirectiveStaticImage } from "../../Components/Visual/DrawDirectiveStaticImage";
import { HorizontalAlignment, VerticalAlignment } from "../../Models/GenericInterfaces";
import { Vec2Utils } from "../../Utility/Vec2";
import { GameEntityBase } from "../EntityBase";

const gibConfig = {
    defaultAngle: 45,
    baseForce: 300,
    extraForceMax: 30,
    forceResist: 0,
    timeToLive: 3,
    rotationSpeed: 360,
}

export class BasicGibEntity extends GameEntityBase {
    private _isClockwise: boolean;

    constructor(parent: GameEntityBase | void | null, sprite: string, angle: number = gibConfig.defaultAngle) {
        super(parent);
        const dd = new DrawDirectiveStaticImage(this, sprite);
        dd.Alignment = { vertical: VerticalAlignment.Middle, horizontal: HorizontalAlignment.Middle };
        dd.Size = 2;

        const f = new GravityForceComponent(this, gibConfig.forceResist);
        f.ApplyForceInDirection(gibConfig.baseForce + Math.random() * gibConfig.extraForceMax, angle % 360);

        this._isClockwise = angle <= 90 && angle > -90

        const timer = new TimerComponent(this, gibConfig.timeToLive, false);
        timer.OnTimesUpCallback = () => this.Delete();
        timer.Start();
    }

    Update(dt: number): void {
        super.Update(dt);

        if (this.Enabled) {
            if (this._isClockwise)
                this.Transform.Rotate(gibConfig.rotationSpeed * dt);
            else
                this.Transform.Rotate(gibConfig.rotationSpeed * -dt);
        }
    }
}