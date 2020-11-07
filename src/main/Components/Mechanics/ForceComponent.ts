import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { Vec2Utils } from "../../Utility/Vec2";
import { ComponentBase } from "../ComponentBase";

export class ForceComponent extends ComponentBase {
    ForceResistence: number = 0;

    private _force: Vec2;
    get Force(): Vec2 { return Vec2Utils.Copy(this._force); }
    set Force(force: Vec2) { this._force = Vec2Utils.Copy(force); }

    private _gravity: Vec2;
    get Gravity(): Vec2 { return Vec2Utils.Copy(this._gravity); }
    set Gravity(gravity: Vec2) { this._gravity = Vec2Utils.Copy(gravity); }

    constructor(parent: EntityBase, force: Vec2, gravity: Vec2, forceResist: number) {
        super(parent);
        this._force = force;
        this._gravity = gravity;
        this.ForceResistence = forceResist;
    }

    Update(dt: number): void {
        super.Update(dt);
        const forceResist = this.ForceResistence * dt;
        this._force[0] = this._force[0] - this._force[0] * forceResist + this._gravity[0] * dt;
        this._force[1] = this._force[1] - this._force[1] * forceResist + this._gravity[1] * dt;

        this.Parent.Transform.TranslateByVec2(Vec2Utils.MultS(this._force, dt));
    }

    ApplyForce(force: Vec2): void {
        this._force = Vec2Utils.Sum(this._force, force);
    }
}