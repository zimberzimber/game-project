import { DrawDirectiveBase } from "./DrawDirectiveBase";
import { EntityBase } from "../../Entities/EntityBase";
import { Vec2 } from "../../Models/Vectors";
import { ISpriteStorage } from "../../Models/SpriteModels";

export abstract class DrawDirectiveImageBase extends DrawDirectiveBase {
    protected readonly _spriteData: ISpriteStorage;

    protected _size: Vec2;
    get Size(): Vec2 { return this._size; }
    set Size(size: Vec2) {
        this._size = size;
        const trans = this._parent.worldRelativeTransform
        this._boundingRadius = Math.sqrt(Math.pow(this._size[0] * trans.Scale[0], 2) + Math.pow(this._size[1] * trans.Scale[1], 2))
    }

    constructor(parent: EntityBase, size: Vec2 = [0, 0]) {
        super(parent);
        this.Size = size;
    }

    get ImageId(): number { return this._spriteData.imageId }
}