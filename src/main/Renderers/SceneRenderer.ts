import { WebglRenderer } from "./BaseRenderer";
import { SceneRendererDrawData, RendererConfig } from "./_RendererInterfaces";

export class WebglSceneRenderer extends WebglRenderer {
    private _textures: { [key: number]: WebGLTexture; } = {};
    private _drawData: SceneRendererDrawData = {};

    constructor(canvas: HTMLCanvasElement, config: RendererConfig, imagesArray: { [key: number]: HTMLImageElement; }) {
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
    }

    SetDrawData(data: { [key: number]: { attributes: number[], indexes: number[] } }): void {
        for (const index in data) {
            this._drawData[index] = {
                attributes: new Float32Array(data[index].attributes),
                indexes: new Uint16Array(data[index].indexes),
            };
        }
    }
    
    Render() {
        this.ActivateProgram();
        const gl = this._context;

        for (const textureId in this._drawData) {
            this._context.bindTexture(gl.TEXTURE_2D, this._textures[textureId]);
            this._context.activeTexture(gl.TEXTURE0);
            this._context.bufferData(gl.ARRAY_BUFFER, this._drawData[textureId].attributes, gl.DYNAMIC_DRAW);
            this._context.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._drawData[textureId].indexes, gl.DYNAMIC_DRAW);
            this._context.drawElements(gl.TRIANGLES, this._drawData[textureId].indexes.length, gl.UNSIGNED_SHORT, 0);
        }
    }
}
