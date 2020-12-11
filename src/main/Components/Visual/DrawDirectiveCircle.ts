import { EntityBase } from "../../Entities/EntityBase";
import { Sprites } from "../../Workers/SpriteManager";
import { ISpriteFrame } from "../../Models/SpriteModels";
import { Log } from "../../Workers/Logger";
import { DrawDirectiveBase } from "./DrawDirectiveBase";
import { ScalarUtil } from "../../Utility/Scalar";
import { Vec2 } from "../../Models/Vectors";
import { Vec2Utils } from "../../Utility/Vec2";

// How many angle steps should the next point skip over. (1 will have 360 points for a full circle, 2:180, etc...)
const angleSkip: number = 9;

export class DrawDirectiveCircle extends DrawDirectiveBase {
    private _frameData: ISpriteFrame = { origin: [0, 0], size: [0, 0] };

    private _imageId: number = 0;
    get ImageId(): number { return this._imageId; }

    private _angle: number = 0;
    get Angle(): number { return this._angle; }
    set Angle(angle: number) {
        this._angle = Math.max(angle % 360, 0);
        this.UpdateWebglData();
    }

    private _rotation: number = 0;
    get Rotation(): number { return this._rotation; }
    set Rotation(rotation: number) {
        this._rotation = rotation;
        this.UpdateWebglData();
    }

    private _spriteRotation: number = 0;
    get SpriteRotation(): number { return this._spriteRotation; }
    set SpriteRotation(rotation: number) {
        this._spriteRotation = rotation;
        this.UpdateWebglData();
    }

    private _radius: number;
    get Radius(): number { return this._radius; }
    set Radius(radius: number) {
        this._radius = radius;
        this._boundingRadius = radius;
        this.UpdateWebglData();
    }

    private _fillPcnt: number;
    get FillPcnt(): number { return this._fillPcnt; }
    set FillPcnt(pcnt: number) {
        this._fillPcnt = ScalarUtil.Clamp(0, pcnt, 1);
        this.UpdateWebglData();
    }

    private _translucent: boolean;
    get IsTranslucent(): boolean { return this._translucent; }

    constructor(parent: EntityBase, spriteName: string, radius: number, angle: number, rotation: number, spriteRotation: number, fillPcnt: number) {
        super(parent);

        const spriteData = Sprites.GetStaticSpriteData(spriteName);
        if (spriteData) {
            this._imageId = spriteData.imageId;
            this._translucent = spriteData.isTranslucent || false;
            this._frameData = spriteData.frame;
        }
        else
            Log.Warn(`Could not retrieve static sprite for DrawDirectiveCircle: ${spriteName}`);

        this.UpdateMultipleParams(radius, angle, rotation, spriteRotation, fillPcnt);
    }

    UpdateMultipleParams(radius: number | null, angle: number | null, rotation: number | null, spriteRotation: number | null, fillPcnt: number | null) {
        if (radius !== null) {
            this._radius = radius;
            this._boundingRadius = radius;
        }

        if (angle !== null)
            this._angle = Math.max(angle % 360, 0);

        if (rotation !== null)
            this._rotation = rotation;

        if (spriteRotation !== null)
            this._spriteRotation = spriteRotation;

        if (fillPcnt !== null)
            this._fillPcnt = ScalarUtil.Clamp(0, fillPcnt, 1);

        this.UpdateWebglData();
    }

    // TO DO:
    // Add the option to pick between clockwise and counter clockwise drawing
    // Add a method modifying multiple params

    protected UpdateWebglData(): void {
        this._webglData = {
            indexes: [],
            attributes: []
        };

        if (this._angle <= 0) return;

        const trans = this._parent.WorldRelativeTransform;
        const origin = Vec2Utils.Sum(trans.Position, this._drawOffset);
        const depth = trans.Depth + this._depthOffset;

        const halfTex: Vec2 = [
            this._frameData.origin[0] + this._frameData.size[0] * 0.5,
            this._frameData.origin[1] + this._frameData.size[1] * 0.5
        ]

        // This DD is always centered.
        this._webglData.attributes.push(
            origin[0], origin[1], depth, halfTex[0], halfTex[1], this._opacity,
        );

        let a: number = 0;
        while (a <= this._angle) {
            let len: Vec2 = [this._radius * this._fillPcnt, 0];
            let tex: Vec2 = [this._frameData.size[0] * 0.5 * this._fillPcnt, 0];

            len = Vec2Utils.RotatePoint(len, ScalarUtil.ToRadian(a + this._rotation));
            tex = Vec2Utils.Sum(Vec2Utils.RotatePoint(tex, ScalarUtil.ToRadian(a + this._spriteRotation)), halfTex);

            this._webglData.attributes.push(
                origin[0] + len[0], origin[1] + len[1], depth, tex[0], tex[1], this._opacity
            );

            // Making sure the last point lands on the angle instead of under/overshooting
            if (a < this._angle)
                a = Math.min(this._angle, a + angleSkip);
            else
                break;
        }

        const verts = this._webglData.attributes.length / 6 - 1;
        for (let i = 1; i < verts; i++)
            this._webglData.indexes.push(0, i, i + 1);
    }
}