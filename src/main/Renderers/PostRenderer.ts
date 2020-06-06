import { WebglRenderer } from "./BaseRenderer";
import { IRendererConfig } from "./_RendererInterfaces";

export class WebglPostRenderer extends WebglRenderer {
    private _frameBuffer: WebGLFramebuffer;
    private _frameTexture: WebGLTexture;
    private _verts: Float32Array = new Float32Array([1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1]);

    get FrameBuffer(): WebGLFramebuffer { return this._frameBuffer; }
    get FrameTexture(): WebGLTexture { return this._frameTexture; }


    constructor(canvas: HTMLCanvasElement, config: IRendererConfig) {
        super(canvas, config);
        const gl = this._context;

        this._frameBuffer = gl.createFramebuffer()!;
        this._frameTexture = gl.createTexture()!;

        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        gl.bindTexture(gl.TEXTURE_2D, this._frameTexture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._frameTexture, 0);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);

        gl.useProgram(this._program);
        this.t1 = gl.getUniformLocation(this._program, "u_sampler")!;
        this.nt1 = this.NextTextureId;
        gl.uniform1i(this.t1, this.nt1);
        gl.useProgram(null);
    }

    t1: WebGLUniformLocation;
    nt1: number;

    SetDrawData(): void { }

    Render() {
        this.ActivateProgram();
        const gl = this._context;

        this._context.activeTexture(gl.TEXTURE0 + this.nt1);
        gl.bindTexture(gl.TEXTURE_2D, this._frameTexture);

        gl.bufferData(gl.ARRAY_BUFFER, this._verts, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 6)

        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
