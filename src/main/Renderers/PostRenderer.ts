import { WebglRenderer } from "./BaseRenderer";
import { IRendererConfig, IWebglActiveTextureInfo } from "./_RendererInterfaces";

export class WebglPostRenderer extends WebglRenderer {
    private _frameBuffer: WebGLFramebuffer;
    private _frameTexture: WebGLTexture;
    private _verts: Float32Array = new Float32Array([1, 1, -1, 1, -1, -1, 1, 1, -1, -1, 1, -1]);
    private _textureInfo: IWebglActiveTextureInfo;
    private _renderBuffer: WebGLRenderbuffer;
    
    BindToBuffer() {
        this._context.bindRenderbuffer(this._context.RENDERBUFFER, this._renderBuffer);
        this._context.bindFramebuffer(this._context.FRAMEBUFFER, this._frameBuffer);
    }

    constructor(canvas: HTMLCanvasElement, config: IRendererConfig) {
        super(canvas, config);
        const gl = this._context;

        this._renderBuffer = gl.createRenderbuffer()!;
        this._frameBuffer = gl.createFramebuffer()!;
        this._frameTexture = gl.createTexture()!;

        gl.bindRenderbuffer(gl.RENDERBUFFER, this._renderBuffer);
        gl.bindFramebuffer(gl.FRAMEBUFFER, this._frameBuffer);
        gl.bindTexture(gl.TEXTURE_2D, this._frameTexture);

        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, canvas.width, canvas.height, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, this._frameTexture, 0);

        gl.renderbufferStorage(gl.RENDERBUFFER, gl.DEPTH_COMPONENT16, canvas.width, canvas.height);
        gl.framebufferRenderbuffer(gl.FRAMEBUFFER, gl.DEPTH_ATTACHMENT, gl.RENDERBUFFER, this._renderBuffer);

        gl.bindTexture(gl.TEXTURE_2D, null);
        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
        gl.bindRenderbuffer(gl.RENDERBUFFER, null);

        gl.useProgram(this._program);

        this._textureInfo = {
            uniformLocation: gl.getUniformLocation(this._program, "u_sampler")!,
            textureUnit: this.NextTextureId
        };
        gl.uniform1i(this._textureInfo.uniformLocation, this._textureInfo.textureUnit);
        gl.useProgram(null);
    }

    // ActivateProgram(): void {
    //     super.ActivateProgram();
    //     const gl = this._context;
    //     gl.disable(gl.BLEND);
    //     gl.disable(gl.DEPTH_TEST);
    // }

    SetDrawData(): void { }

    Render() {
        this.ActivateProgram();
        const gl = this._context;

        this._context.activeTexture(gl.TEXTURE0 + this._textureInfo.textureUnit);
        gl.bindTexture(gl.TEXTURE_2D, this._frameTexture);

        gl.bufferData(gl.ARRAY_BUFFER, this._verts, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.TRIANGLES, 0, 6)

        gl.bindTexture(gl.TEXTURE_2D, null);
    }
}
