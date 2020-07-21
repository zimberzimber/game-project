import { WebglRenderer } from "./BaseRenderer";
import { IRendererConfig, IWebglActiveTextureInfo } from "./_RendererInterfaces";
import { MiscUtil } from "../Utility/Misc";

interface IMixSubjectInfo extends IWebglActiveTextureInfo {
    frameBuffer: WebGLFramebuffer;
    renderBuffer: WebGLRenderbuffer;
    texture: WebGLTexture;
}

export class WebglMixRenderer extends WebglRenderer {
    private _mixSubjects: IMixSubjectInfo[] = [];
    private _verts: Float32Array = new Float32Array([1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1]);

    BindToSceneBuffer() {
        this._context.bindRenderbuffer(this._context.RENDERBUFFER, this._mixSubjects[0].renderBuffer);
        this._context.bindFramebuffer(this._context.FRAMEBUFFER, this._mixSubjects[0].frameBuffer);
    }

    BindToLightBuffer() {
        this._context.bindRenderbuffer(this._context.RENDERBUFFER, this._mixSubjects[1].renderBuffer);
        this._context.bindFramebuffer(this._context.FRAMEBUFFER, this._mixSubjects[1].frameBuffer);
    }

    constructor(canvas: HTMLCanvasElement, config: IRendererConfig) {
        super(canvas, config);
        const gl = this._context;

        gl.useProgram(this._program);
        for (let i = 0; i < 2; i++) {
            const frameBuffer = gl.createFramebuffer()!;
            const texture = MiscUtil.GenerateWebglEmptyTexture(gl, [canvas.width, canvas.height]);
            const renderBuffer = gl.createRenderbuffer()!;

            gl.bindRenderbuffer(gl.RENDERBUFFER, renderBuffer);
            gl.bindFramebuffer(gl.FRAMEBUFFER, frameBuffer);
            gl.bindTexture(gl.TEXTURE_2D, texture);

            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);

            gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width, canvas.height);
            gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, renderBuffer);

            const uniformLocation = gl.getUniformLocation(this._program, `u_sampler_${i}`)!;
            const textureUnit = this.NextTextureId;

            gl.uniform1i(uniformLocation, textureUnit);
            this._mixSubjects.push({ frameBuffer, renderBuffer, texture, uniformLocation, textureUnit });
        }

        gl.useProgram(null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);
    }

    SetDrawData(): void { }

    // ActivateProgram(): void {
    //     super.ActivateProgram();
    //     const gl = this._context;
    //     gl.disable(gl.BLEND);
    //     gl.enable(gl.DEPTH_TEST);
    // }

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