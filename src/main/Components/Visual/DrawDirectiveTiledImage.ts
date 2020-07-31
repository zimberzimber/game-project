import { EntityBase } from "../../Entities/EntityBase";
import { Images } from "../../Workers/ImageManager";
import { Vec2 } from "../../Models/Vectors";
import { Vec2Utils } from "../../Utility/Vec2";
import { DrawDirectiveImageBase } from "./DrawDirectiveImageBase";
import { Sprites } from "../../Workers/SpriteManager";
import { Log } from "../../Workers/Logger";

export class DrawDirectiveTiledImage extends DrawDirectiveImageBase {
    private _imageId: number;
    get ImageId(): number { return this._imageId; }

    private _tileSize: Vec2;
    get TileSize(): Vec2 { return Vec2Utils.Copy(this._tileSize); }
    set TileSize(size: Vec2) {
        this._tileSize = Vec2Utils.Copy(size);
        this.UpdateWebglData();
    }

    constructor(parent: EntityBase, imageName: string, tileSize: Vec2, size: Vec2) {
        super(parent);
        this._imageId = Images.GetImageIdFromName(imageName);
        this._tileSize = tileSize;
        this._size = size;
        this._webglData.indexes = [
            0, 1, 2,
            0, 2, 3
        ];

        const spriteData = Sprites.GetFullImageAsSprite(imageName);
        if (spriteData) {
            this.FrameData = spriteData.frame;
        } else {
            Log.Warn(`Could not retrieve image for DrawDirectiveTiledImage: ${imageName}`);
        }
    }

    protected UpdateWebglData(): void {
        super.UpdateWebglData();

        this._webglData.attributes[3] = this._size[0] / this._tileSize[0];
        this._webglData.attributes[4] = 0;

        this._webglData.attributes[8] = 0;
        this._webglData.attributes[9] = 0;

        this._webglData.attributes[13] = 0;
        this._webglData.attributes[14] = this._size[1] / this._tileSize[1];

        this._webglData.attributes[18] = this._size[0] / this._tileSize[0];
        this._webglData.attributes[19] = this._size[1] / this._tileSize[1];
    }
}

export class DrawDirectiveScrollableTiledImage extends DrawDirectiveTiledImage {
    private _scrolled: Vec2 = [0, 0];
    private _scrollSpeed: Vec2 = [0, 0];

    // No need to update Webgl data here because it doesn't affect the image directly, only through update
    get ScrollSpeed(): Vec2 { return Vec2Utils.Copy(this._scrollSpeed); }
    set ScrollSpeed(speed: Vec2) { this._scrollSpeed = Vec2Utils.Copy(speed); }
    set ScrollSpeedX(speed: number) { this._scrollSpeed[0] = speed; }
    set ScrollSpeedY(speed: number) { this._scrollSpeed[1] = speed; }

    constructor(parent: EntityBase, imageName: string, tileSize: Vec2, size: Vec2, scrollSpeed: Vec2) {
        super(parent, imageName, tileSize, size);
        this.ScrollSpeed = scrollSpeed;
    }

    Update(delta: number) {
        super.Update(delta);

        if (this._scrollSpeed[0] || this._scrollSpeed[1]) {
            this._scrolled = Vec2Utils.Sum(this._scrolled, Vec2Utils.MultS(this._scrollSpeed, delta));
            this._scrolled = [this._scrolled[0] % this.TileSize[0], this._scrolled[1] % this.TileSize[1]]
            this.UpdateWebglData();
        }
    }

    protected UpdateWebglData(): void {
        super.UpdateWebglData();

        // TypeScript has this funky thing where default field values are set only after the parents constructor
        // So I circumvent this one time thing with the first check:
        if (this._scrolled && (this._scrolled[0] || this._scrolled[1])) {
            const relative: Vec2 = [
                this._scrolled[0] / this.TileSize[0],
                this._scrolled[1] / this.TileSize[1]
            ];

            this._webglData.attributes[3] -= relative[0];
            this._webglData.attributes[4] -= relative[1];

            this._webglData.attributes[8] -= relative[0];
            this._webglData.attributes[9] -= relative[1];

            this._webglData.attributes[13] -= relative[0];
            this._webglData.attributes[14] -= relative[1];

            this._webglData.attributes[18] -= relative[0];
            this._webglData.attributes[19] -= relative[1];
        }
    }
}