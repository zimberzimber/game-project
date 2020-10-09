import { WebglRenderer } from "./BaseRenderer";
import { IRendererConfig, IWebglActiveTextureInfo, IAttributesIndexesByImageId, IAttributesIndexesTyped } from "./_RendererInterfaces";
import { SharedWebglTextures } from "./_SharedWebglTextureContainer";
import { MiscUtil } from "../Utility/Misc";
import { ScalarUtil } from "../Utility/Scalar";

/**  the index in the array doesn't represent the depth, just the order at which everything has to be drawn
translucent: [
    { // Depth -50
        0: {data...},
        3: {data...}
    },
    { // Depth -2.33
        1: {data...},
        3: {data...}
    },
    { // Depth 3
        0: {data...},
        4: {data...},
        1: {data...}
    },
    { // Depth 5
        1: {data...}
    }
]*/
export interface ISceneDrawData {
    opaque: IAttributesIndexesByImageId;
    translucent: IAttributesIndexesByImageId[];
}

interface ISceneRenderData {
    opaque: { [key: number]: IAttributesIndexesTyped };
    translucent: { [key: number]: IAttributesIndexesTyped }[];
}

export class WebglSceneRenderer extends WebglRenderer {
    private _drawData: ISceneRenderData = { opaque: {}, translucent: [] };
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

    SetDrawData(data: ISceneDrawData): void {
        this._drawData = { opaque: {}, translucent: [] };
        for (const imageId in data.opaque) {
            this._drawData.opaque[imageId] = {
                attributes: new Float32Array(data.opaque[imageId].attributes),
                indexes: new Uint16Array(data.opaque[imageId].indexes),
            };
        }

        for (const depth in data.translucent) {
            this._drawData.translucent[depth] = [];

            for (const imageId in data.translucent[depth]) {
                this._drawData.translucent[depth][imageId] = {
                    attributes: new Float32Array(data.translucent[depth][imageId].attributes),
                    indexes: new Uint16Array(data.translucent[depth][imageId].indexes),
                };
            }
        }
    }

    ActivateProgram(): void {
        super.ActivateProgram();
        const gl = this._context;
        gl.enable(gl.BLEND);
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
        gl.enable(gl.DEPTH_TEST);
        gl.depthFunc(gl.LEQUAL);
    }

    Render() {
        this.ActivateProgram();
        const gl = this._context;

        // Draw opaque normally
        for (let textureId in this._drawData.opaque) {
            gl.activeTexture(gl.TEXTURE0 + this._activeTextureInfo.textureUnit);
            gl.bindTexture(gl.TEXTURE_2D, SharedWebglTextures.GetTexture(textureId)!);
            gl.bufferData(gl.ARRAY_BUFFER, this._drawData.opaque[textureId].attributes, gl.DYNAMIC_DRAW);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, this._drawData.opaque[textureId].indexes, gl.DYNAMIC_DRAW);
            gl.drawElements(gl.TRIANGLES, this._drawData.opaque[textureId].indexes.length, gl.UNSIGNED_SHORT, 0);
        }

        // Draw translucent in depth ascending order
        this._drawData.translucent.forEach(dd => {
            for (let textureId in dd) {
                gl.activeTexture(gl.TEXTURE0 + this._activeTextureInfo.textureUnit);
                gl.bindTexture(gl.TEXTURE_2D, SharedWebglTextures.GetTexture(textureId)!);
                gl.bufferData(gl.ARRAY_BUFFER, dd[textureId].attributes, gl.DYNAMIC_DRAW);
                gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, dd[textureId].indexes, gl.DYNAMIC_DRAW);
                gl.drawElements(gl.TRIANGLES, dd[textureId].indexes.length, gl.UNSIGNED_SHORT, 0);
            }
        });

        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
