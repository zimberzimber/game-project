import { DrawDirectiveBase } from "../Bases/DrawDirectiveBase";
import { EntityBase } from "../Bases/EntityBase";
import { _G } from "../Main";
import { Vec2 } from "../Models/Vec2";
import { ImageDrawDirectiveData } from "../Models/ImageDrawDirectiveData";
import { DrawLayer } from "../Models/DrawLayer";
import SpriteAtlas from "../Workers/SpriteAtlas";

export class ImageDrawDirective extends DrawDirectiveBase {
    image: ImageDrawDirectiveData;
    size: Vec2;

    constructor(parent: EntityBase, drawLayer: DrawLayer, spriteName: string, size: Vec2 = null) {
        super(parent, drawLayer);
        this.image = _G.SpriteAtlas.GetSprite(spriteName);
        this.size = size;
    }

    GetWebGlData(): number[] {
        const ox = this.size.x / 2;
        const oy = this.size.y / 2;

        const rx = Math.sin(this.parent.transform.GetRotation());
        const ry = Math.cos(this.parent.transform.GetRotation());

        const sd = SpriteAtlas.GetStaticSprite('heart');

        // transformX, transformY, layer,  offsetX, offsetY,  rotX, rotY,  texX, texY
        return [
            this.parent.transform.position.x, this.parent.transform.position.y, 0, ox, oy, rx, ry, sd.coords[0] + sd.size[0], sd.coords[1] + sd.size[1],
            this.parent.transform.position.x, this.parent.transform.position.y, 0, -ox, oy, rx, ry, sd.coords[0], sd.coords[1] + sd.size[1],
            this.parent.transform.position.x, this.parent.transform.position.y, 0, -ox, -oy, rx, ry, sd.coords[0], sd.coords[1],
            this.parent.transform.position.x, this.parent.transform.position.y, 0, ox, -oy, rx, ry, sd.coords[0] + sd.size[0], sd.coords[1],
        ];
    }

    // Draw(context: any): void {
    //     let width: number;
    //     let height: number;

    //     if (this.size == null) {
    //         width = this.image.width * this.parent.transform.scale.x;
    //         height = this.image.height * this.parent.transform.scale.y;
    //     } else {
    //         width = this.size.x * this.parent.transform.scale.x;
    //         height = this.size.y * this.parent.transform.scale.y;
    //     }

    //     const x = this.parent.transform.position.x;
    //     const y = this.parent.transform.position.y;
    //     const angle = this.parent.transform.GetRotationRadian();

    //     if (angle == 0) {
    //         context.drawImage(this.image.img, this.image.x, this.image.y, this.image.width, this.image.height, x - width / 2, y - height / 2, width, height);
    //     } else {
    //         context.translate(x, y);
    //         context.rotate(angle);
    //         context.drawImage(this.image.img, this.image.x, this.image.y, this.image.width, this.image.height, (-width) / 2, (-height) / 2, width, width, height);
    //         context.setTransform(1, 0, 0, 1, 0, 0);
    //     }
    // }
}