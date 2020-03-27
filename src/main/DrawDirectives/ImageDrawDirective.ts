import { DrawDirectiveBase } from "../Bases/DrawDirectiveBase";
import { EntityBase } from "../Bases/EntityBase";
import { _G } from "../Main";
import Vec2 from "../Models/Vec2";
import { DrawLayer } from "../Models/DrawLayer";
import SpriteAtlas from "../Workers/SpriteAtlas";

export class ImageDrawDirective extends DrawDirectiveBase {
    size: Vec2;
    spriteName: string;

    constructor(parent: EntityBase, drawLayer: DrawLayer, spriteName: string, size: Vec2 = [0, 0]) {
        super(parent, drawLayer);
        this.size = size;
        this.spriteName = spriteName;
    }

    GetWebGlData(): number[] {
        const ox = this.size[0] / 2;
        const oy = this.size[1] / 2;

        const rx = Math.sin(this.parent.transform.GetRotation());
        const ry = Math.cos(this.parent.transform.GetRotation());

        const sd = SpriteAtlas.GetStaticSprite(this.spriteName);

        // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
        return [
            this.parent.transform.position[0], this.parent.transform.position[1], 0, ox, oy, rx, ry, sd.coords[0] + sd.size[0], sd.coords[1] + sd.size[1],
            this.parent.transform.position[0], this.parent.transform.position[1], 0, -ox, oy, rx, ry, sd.coords[0], sd.coords[1] + sd.size[1],
            this.parent.transform.position[0], this.parent.transform.position[1], 0, -ox, -oy, rx, ry, sd.coords[0], sd.coords[1],
            this.parent.transform.position[0], this.parent.transform.position[1], 0, ox, -oy, rx, ry, sd.coords[0] + sd.size[0], sd.coords[1],
        ];
    }
}