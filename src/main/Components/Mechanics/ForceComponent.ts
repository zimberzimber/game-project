import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { ScalarUtil } from "../../Utility/Scalar";
import { Vec2Utils } from "../../Utility/Vec2";
import { ComponentBase } from "../ComponentBase";

const gravity = 1000;

abstract class ForceComponentBase extends ComponentBase {
    ForceResistence: number = 0;

    protected _force: Vec2;
    get Force(): Vec2 { return Vec2Utils.Copy(this._force); }
    set Force(force: Vec2) { this._force = Vec2Utils.Copy(force); }

    protected _forceDirection: number;
    get ForceDirection(): number { return this._forceDirection; }

    constructor(parent: EntityBase, forceResist: number, initialForce: Vec2 = [0, 0]) {
        super(parent);
        this.ForceResistence = forceResist;
        this.Force = initialForce;
    }

    Update(dt: number): void {
        super.Update(dt);
        const forceResist = this.ForceResistence * dt;
        this._force[0] = this._force[0] - this._force[0] * forceResist;
        this._force[1] = this._force[1] - this._force[1] * forceResist;
    }

    ApplyForce(force: Vec2): void {
        this._force = Vec2Utils.Sum(this._force, force);
    }

    ApplyForceInDirection(force: number, angle: number): void {
        this.ApplyForce(Vec2Utils.AngleToVector(angle, force));
    }
}

export class ForceComponent extends ForceComponentBase {
    Update(dt: number): void {
        super.Update(dt);
        this._forceDirection = Vec2Utils.GetAngle([0, 0], this._force);
        this.Parent.Transform.TranslateByVec2(Vec2Utils.MultS(this._force, dt));
    }
}

export class GravityForceComponent extends ForceComponentBase {
    Update(dt: number): void {
        super.Update(dt);
        this._force[1] -= gravity * dt;
        this._forceDirection = Vec2Utils.GetAngle([0, 0], this._force);
        this.Parent.Transform.TranslateByVec2(Vec2Utils.MultS(this._force, dt));
    }
}