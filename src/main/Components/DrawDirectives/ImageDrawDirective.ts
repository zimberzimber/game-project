import { DrawDirectiveBase } from "../../Bases/DrawDirectiveBase";
import { EntityBase } from "../../Bases/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { ISpriteStorage } from "../../Models/SpriteModels";

export abstract class ImageDrawDirective extends DrawDirectiveBase {
    size: Vec2;
    protected readonly _spriteData: ISpriteStorage;

    constructor(parent: EntityBase, size: Vec2 = [0, 0]) {
        super(parent);
        this.size = size;
    }

    get ImageId(): number { return this._spriteData.imageId }
}