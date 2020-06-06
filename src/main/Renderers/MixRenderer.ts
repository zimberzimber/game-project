import { WebglRenderer } from "./BaseRenderer";
import { IRendererConfig } from "./_RendererInterfaces";

export class WebglMixRenderer extends WebglRenderer {
    private _frameBuffers: WebGLFramebuffer[] = [];
    private _frameTextures: WebGLTexture[] = [];
    private _verts: Float32Array = new Float32Array([1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1]);

    get FrameBuffer1(): WebGLFramebuffer { return this._frameBuffers[0]; }
    get FrameTexture1(): WebGLTexture { return this._frameTextures[0]; }

    get FrameBuffer2(): WebGLFramebuffer { return this._frameBuffers[1]; }
    get FrameTexture2(): WebGLTexture { return this._frameTextures[1]; }

    t1: WebGLUniformLocation;
    t2: WebGLUniformLocation;
    nt1: number;
    nt2: number;

    constructor(canvas: HTMLCanvasElement, config: IRendererConfig) {
        super(canvas, config);
        const gl = this._context;

        for (let i = 0; i < 2; i++) {
            this._frameBuffers[i] = gl.createFramebuffer()!;
            this._frameTextures[i] = gl.createTexture()!;

            gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffers[i]);
            gl.bindTexture(gl.TEXTURE_2D, this._frameTextures[i]);

            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
            gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._frameTextures[i], 0);
        }

        gl.useProgram(this._program);
        this.t1 = gl.getUniformLocation(this._program, "u_sampler_0")!;
        this.t2 = gl.getUniformLocation(this._program, "u_sampler_1")!;
        this.nt1 = this.NextTextureId;
        this.nt2 = this.NextTextureId;
        gl.uniform1i(this.t1, this.nt1);
        gl.uniform1i(this.t2, this.nt2);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.useProgram(null);
    }

    SetDrawData(): void { }

    Render(): void {
        this.ActivateProgram();
        const gl = this._context;

        gl.activeTexture(gl.TEXTURE0 + this.nt1);
        gl.bindTexture(gl.TEXTURE_2D, this._frameTextures[0]);

        gl.activeTexture(gl.TEXTURE0 + this.nt2);
        gl.bindTexture(gl.TEXTURE_2D, this._frameTextures[1]);

        gl.bufferData(gl.ARRAY_BUFFER, this._verts, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 6)

        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}