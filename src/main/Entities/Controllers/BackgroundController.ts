import { DrawDirectiveTiledImage } from "../../Components/Visual/DrawDirectiveTiledImage";
import { LightComponent } from "../../Components/Visual/Light";
import { VerticalAlignment } from "../../Models/GenericInterfaces";
import { IBackgroundControllerConfig } from "../../Models/LevelModels";
import { ScalarUtil } from "../../Utility/Scalar";
import { Camera } from "../../Workers/CameraManager";
import { GameEntityBase } from "../EntityBase";

export class BackgroundControllerEntity extends GameEntityBase {
    private _back: { dd: DrawDirectiveTiledImage, speed: number }[] = [];
    private _front: { dd: DrawDirectiveTiledImage, speed: number }[] = [];
    private _light?: LightComponent;

    constructor(cfg: IBackgroundControllerConfig) {
        super();
        const camScale = Camera.Transform.Scale;

        for (let i = 0; i < cfg.back.length; i++) {
            const c = cfg.back[i];
            const width = camScale[0] < c.tileWidth ? c.tileWidth * 2 : camScale[0] * 2;
            const dd = new DrawDirectiveTiledImage(this, c.imageName, [c.tileWidth, c.height], [width, c.height]);
            dd.DepthOffset = cfg.backDepthOffset - (cfg.back.length - 1) + i;

            switch (c.verticalAlignment) {
                case (VerticalAlignment.Top):
                    dd.VerticalAlignment = VerticalAlignment.Top;
                    dd.DrawOffset = [0, camScale[1]];
                    break
                case (VerticalAlignment.Middle):
                    dd.VerticalAlignment = VerticalAlignment.Middle;
                    dd.DrawOffset = [0, camScale[1] * 0.5];
                    break;
            }

            this._back.push({
                dd,
                speed: c.scrollOverLength ? c.scrollSpeed / c.scrollOverLength : (c.scrollSpeed ? c.scrollSpeed : 0),
            });
        }

        for (let i = 0; i < cfg.front.length; i++) {
            const c = cfg.front[i];
            const width = camScale[0] < c.tileWidth ? c.tileWidth * 2 : camScale[0] * 2;
            const dd = new DrawDirectiveTiledImage(this, c.imageName, [c.tileWidth, c.height], [width, c.height]);
            dd.DepthOffset = cfg.frontDepthOffset + i;

            switch (c.verticalAlignment) {
                case (VerticalAlignment.Top):
                    dd.VerticalAlignment = VerticalAlignment.Top;
                    dd.DrawOffset = [0, camScale[1]];
                    break
                case (VerticalAlignment.Middle):
                    dd.VerticalAlignment = VerticalAlignment.Middle;
                    dd.DrawOffset = [0, camScale[1] * 0.5];
                    break;
            }

            this._front.push({
                dd,
                speed: c.scrollOverLength ? c.scrollSpeed / c.scrollOverLength : (c.scrollSpeed ? c.scrollSpeed : 0),
            });
        }

        if (cfg.globalLight) {
            const cs = Camera.Transform.Scale;
            this._light = new LightComponent(this, cfg.globalLight, ScalarUtil.DiagonalLength(cs[0], cs[1]), 1);
        }
    }

    Update(delta: number) {
        super.Update(delta);

        // Was considering performing the same operation on both of them with the piece piece of code via...
        // [this._front, this._back].forEach(dds => dds.forEach(e => {
        // But then decided taking two variables, shoving them in an array, and then iterating over it every frame is too heavy of a price for something as small as this 

        this._back.forEach(e => {
            const off = e.dd.DrawOffset;
            off[0] = (off[0] - e.speed) % e.dd.TileSize[0];
            e.dd.DrawOffset = off;
        });

        this._front.forEach(e => {
            const off = e.dd.DrawOffset;
            off[0] = (off[0] - e.speed) % e.dd.TileSize[0];
            e.dd.DrawOffset = off;
        });
    }
}