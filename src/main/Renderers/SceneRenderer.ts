import { WebglRenderer } from "./BaseRenderer";
import { ISceneRendererDrawData, IRendererConfig, IWebglActiveTextureInfo } from "./_RendererInterfaces";
import { SharedWebglTextures } from "./_SharedWebglTextureContainer";
import { MiscUtil } from "../Utility/Misc";
import { ScalarUtil } from "../Utility/Scalar";

export class WebglSceneRenderer extends WebglRenderer {
    private _drawData: ISceneRendererDrawData = {};
    private _activeTextureInfo: IWebglActiveTextureInfo;

    constructor(canvas: HTMLCanvasElement, config: IRendererConfig, imagesArray: { [key: number]: HTMLImageElement; }) {
        super(canvas, config);
        const gl = this._context;

        for (const key in imagesArray)
            if (!SharedWebglTextures.GetTexture(key)) {
                const wrap: boolean = ScalarUtil.IsPowerOf2(imagesArray[key].width) && ScalarUtil.IsPowerOf2(imagesArray[key].height);
                SharedWebglTextures.AddTexture(key, MiscUtil.GenerateWebglTextureFromImage(gl, imagesArray[key], wrap));
            }


        gl.useProgram(this._program);
        this._activeTextureInfo = {
            uniformLocation: gl.getUniformLocation(this._program, "u_sampler")!,
            textureUnit: this.NextTextureId
        };
        gl.uniform1i(this._activeTextureInfo.uniformLocation, this._activeTextureInfo.textureUnit);
        gl.useProgram(null);
    }

    SetDrawData(data: { [key: number]: { attributes: number[], indexes: number[] } }): void {
        this._drawData = {};
        for (const index in data) {
            this._drawData[index] = {
                attributes: new Float32Array(data[index].attributes),
                indexes: new Uint16Array(data[index].indexes),
            };
        }
    }

    ActivateProgram(): void {
        super.ActivateProgram();
        const gl = this._context;
        // gl.enable(gl.BLEND);
        // gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        // gl.enable(gl.DEPTH_TEST);
        // gl.depthFunc(gl.ALWAYS);
    }

    Render() {
        this.ActivateProgram();
        const gl = this._context;

        for (const textureId in this._drawData) {
            gl.activeTexture(gl.TEXTURE0 + this._activeTextureInfo.textureUnit);
            gl.bindTexture(gl.TEXTURE_2D, SharedWebglTextures.GetTexture(textureId)!);
            gl.bufferData(gl.ARRAY_BUFFER, this._drawData[textureId].attributes, gl.DYNAMIC_DRAW);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._drawData[textureId].indexes, gl.DYNAMIC_DRAW);
            gl.drawElements(gl.TRIANGLES, this._drawData[textureId].indexes.length, gl.UNSIGNED_SHORT, 0);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
