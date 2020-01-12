import { EntityBase } from "../Bases/EntityBase";
import { DrawDirectiveBase } from "../Bases/DrawDirectiveBase";
import { DrawLayer } from "../Models/DrawLayer";

export class CircleDrawDirective extends DrawDirectiveBase {
    radius: number;

    constructor(parent: EntityBase, drawLayer: DrawLayer, radius: number) {
        super(parent, drawLayer);
        this.radius = radius;
    }

    Draw(context: any): void {
        context.beginPath();
        context.arc(this.parent.transform.position.x, this.parent.transform.position.y, this.radius, 0, 2 * Math.PI);
        context.arcStyle = "white";
        context.fillStyle = "white";
        context.fill();
        context.lineWidth = this.radius * 0.1;
        context.stroke();
    }
}
