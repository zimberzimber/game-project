import { WebglRenderer } from "./BaseRenderer";
import { IRendererConfig, IWebglActiveTextureInfo } from "./_RendererInterfaces";

interface IMixSubjectInfo extends IWebglActiveTextureInfo {
    buffer: WebGLFramebuffer;
    texture: WebGLTexture;
}

export class WebglMixRenderer extends WebglRenderer {
    private _mixSubjects: IMixSubjectInfo[] = [];
    private _verts: Float32Array = new Float32Array([1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1]);

    get FrameBuffer1(): WebGLFramebuffer { return this._mixSubjects[0].buffer; }
    get FrameBuffer2(): WebGLFramebuffer { return this._mixSubjects[1].buffer; }

    constructor(canvas: HTMLCanvasElement, config: IRendererConfig) {
        super(canvas, config);
        const gl = this._context;

        gl.useProgram(this._program);
        for (let i = 0; i < 2; i++) {
            const buffer = gl.createFramebuffer()!;
            const texture = gl.createTexture()!;

            gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

            const uniformLocation = gl.getUniformLocation(this._program, `u_sampler_${i}`)!;
            const textureUnit = this.NextTextureId;

            gl.uniform1i(uniformLocation, textureUnit);
            this._mixSubjects.push({ buffer, texture, uniformLocation, textureUnit });
        }

        gl.useProgram(null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    SetDrawData(): void { }

    Render(): void {
        this.ActivateProgram();
        const gl = this._context;

        for (let i = 0; i < this._mixSubjects.length; i++) {
            gl.activeTexture(gl.TEXTURE0 + this._mixSubjects[i].textureUnit);
            gl.bindTexture(gl.TEXTURE_2D, this._mixSubjects[i].texture);
        }

        gl.bufferData(gl.ARRAY_BUFFER, this._verts, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 6);
    }
}