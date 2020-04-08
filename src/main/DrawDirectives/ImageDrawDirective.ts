import { DrawDirectiveBase } from "../Bases/DrawDirectiveBase";
import { EntityBase } from "../Bases/EntityBase";
import { _G } from "../Main";
import Vec2 from "../Models/Vec2";
import SpriteAtlas from "../Workers/SpriteAtlas";

export class ImageDrawDirective extends DrawDirectiveBase {
    size: Vec2;
    spriteName: string;

    constructor(parent: EntityBase, spriteName: string, size: Vec2 = [0, 0]) {
        super(parent);
        this.size = size;
        this.spriteName = spriteName;
    }

    GetWebGlData(): number[] {
        const absTransform = this.parent.GetWorldRelativeTransform();

        const ox = this.size[0] / 2 * absTransform.scale[0];
        const oy = this.size[1] / 2 * absTransform.scale[1];

        const rx = Math.sin(absTransform.GetRotationRadian());
        const ry = Math.cos(absTransform.GetRotationRadian());

        const sd = SpriteAtlas.GetStaticSprite(this.spriteName);

        // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
        return [
            absTransform.position[0], absTransform.position[1], 0, ox, oy, rx, ry, sd.coords[0] + sd.size[0], sd.coords[1],
            absTransform.position[0], absTransform.position[1], 0, -ox, oy, rx, ry, sd.coords[0], sd.coords[1],
            absTransform.position[0], absTransform.position[1], 0, -ox, -oy, rx, ry, sd.coords[0], sd.coords[1] + sd.size[1],
            absTransform.position[0], absTransform.position[1], 0, ox, -oy, rx, ry, sd.coords[0] + sd.size[0], sd.coords[1] + sd.size[1],
        ];
    }
}