import { WebglRenderer } from "./BaseRenderer";
import { ISceneRendererDrawData, IRendererConfig, IWebglTextureInfo } from "./_RendererInterfaces";

export class WebglSceneRenderer extends WebglRenderer {
    private _textures: { [key: number]: WebGLTexture; } = {};
    private _drawData: ISceneRendererDrawData = {};
    private _textureInfo: IWebglTextureInfo;

    constructor(canvas: HTMLCanvasElement, config: IRendererConfig, imagesArray: { [key: number]: HTMLImageElement; }) {
        super(canvas, config);
        const gl = this._context;

        for (const key in imagesArray) {
            this._textures[key] = gl.createTexture()!;
            gl.bindTexture(gl.TEXTURE_2D, this._textures[key]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagesArray[key]);
            gl.bindTexture(gl.TEXTURE_2D, null);
        }

        gl.useProgram(this._program);
        this._textureInfo = {
            uniformLocation: gl.getUniformLocation(this._program, "u_sampler")!,
            textureUnit: this.NextTextureId
        };
        gl.uniform1i(this._textureInfo.uniformLocation, this._textureInfo.textureUnit);
        gl.useProgram(null);
    }


    SetDrawData(data: { [key: number]: { attributes: number[], indexes: number[] } }): void {
        for (const index in data) {
            this._drawData[index] = {
                attributes: new Float32Array(data[index].attributes),
                indexes: new Uint16Array(data[index].indexes),
            };
        }
    }

    ActivateProgram():void{
        super.ActivateProgram();
        const gl = this._context;
        gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.BLEND);
        gl.enable(gl.DEPTH_TEST);
    }

    Render() {
        this.ActivateProgram();
        const gl = this._context;

        for (const textureId in this._drawData) {
            gl.activeTexture(gl.TEXTURE0 + this._textureInfo.textureUnit);
            gl.bindTexture(gl.TEXTURE_2D, this._textures[textureId]);
            gl.bufferData(gl.ARRAY_BUFFER, this._drawData[textureId].attributes, gl.DYNAMIC_DRAW);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._drawData[textureId].indexes, gl.DYNAMIC_DRAW);
            gl.drawElements(gl.TRIANGLES, this._drawData[textureId].indexes.length, gl.UNSIGNED_SHORT, 0);
        }
        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
