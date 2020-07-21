import { DrawDirectiveBase } from "./DrawDirectiveBase";
import { ITransformEventArgs } from "../../Models/Transform";
import { EntityBase } from "../../Entities/EntityBase";
import { Images } from "../../Workers/ImageManager";
import { Vec2 } from "../../Models/Vectors";
import { Vec2Utils } from "../../Utility/Vec2";
import { Game } from "../../Workers/Game";

export class DrawDirectiveTiledImage extends DrawDirectiveBase {
    private _imageId: number;
    get ImageId(): number { return this._imageId; }

    private _size: Vec2;
    get Size(): Vec2 { return Vec2Utils.Copy(this._size); }
    set Size(size: Vec2) {
        this._size = Vec2Utils.Copy(size);
        this.CalculateDrawData();
    }

    private _tileSize: Vec2;
    get TileSize(): Vec2 { return Vec2Utils.Copy(this._tileSize); }
    set TileSize(size: Vec2) {
        this._tileSize = Vec2Utils.Copy(size);
        this.CalculateDrawData();
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
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        this.CalculateDrawData();
    }

    protected CalculateDrawData(): void {
        const t = this.Parent.worldRelativeTransform;
        const points: Vec2[] = [
            [t.Position[0] + this._size[0] / 2 * t.Scale[0], t.Position[1] + this._size[1] / 2 * t.Scale[1]],
            [t.Position[0] - this._size[0] / 2 * t.Scale[0], t.Position[1] + this._size[1] / 2 * t.Scale[1]],
            [t.Position[0] - this._size[0] / 2 * t.Scale[0], t.Position[1] - this._size[1] / 2 * t.Scale[1]],
            [t.Position[0] + this._size[0] / 2 * t.Scale[0], t.Position[1] - this._size[1] / 2 * t.Scale[1]],
        ];

        if (t.Rotation != 0)
            for (let i = 0; i < points.length; i++)
                points[i] = Vec2Utils.RotatePointAroundCenter(points[i], t.RotationRadian, t.Position);

        this._webglData.attributes = [
            points[0][0], points[0][1], t.Depth, this._size[0] / this._tileSize[0], 0,
            points[1][0], points[1][1], t.Depth, 0, 0,
            points[2][0], points[2][1], t.Depth, 0, this._size[1] / this._tileSize[1],
            points[3][0], points[3][1], t.Depth, this._size[0] / this._tileSize[0], this._size[1] / this._tileSize[1],
        ];
    }
}

export class DrawDirectiveScrollableTiledImage extends DrawDirectiveTiledImage {
    private _scrolled: Vec2 = [0, 0];
    private _scrollSpeed: Vec2 = [0, 0];
    get ScrollSpeed(): Vec2 { return Vec2Utils.Copy(this._scrollSpeed); }
    set ScrollSpeed(speed: Vec2) {
        this._scrollSpeed = Vec2Utils.Copy(speed);
        this.CalculateDrawData();
    }

    set ScrollSpeedX(speed: number) {
        this._scrollSpeed[0] = speed;
        this.CalculateDrawData();
    }
    set ScrollSpeedY(speed: number) {
        this._scrollSpeed[1] = speed;
        this.CalculateDrawData();
    }

    constructor(parent: EntityBase, imageName: string, tileSize: Vec2, size: Vec2, scrollSpeed: Vec2) {
        super(parent, imageName, tileSize, size);
        this.ScrollSpeed = scrollSpeed;
    }

    Update(delta: number) {
        super.Update(delta);

        if (this._scrollSpeed[0] != 0 || this._scrollSpeed[1] != 0) {
            this._scrolled = Vec2Utils.Sum(this._scrolled, Vec2Utils.MultS(this._scrollSpeed, delta));
            this._scrolled = [this._scrolled[0] % this.TileSize[0], this._scrolled[1] % this.TileSize[1]]
            this.CalculateDrawData();
        }
    }

    protected CalculateDrawData(): void {
        super.CalculateDrawData();
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