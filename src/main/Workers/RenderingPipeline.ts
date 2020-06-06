import { WebglRenderer } from "../Renderers/BaseRenderer";
import { WebglSceneRenderer } from "../Renderers/SceneRenderer";
import { Images } from "./ImageManager";
import { Log, LogLevel } from "./Logger";
import { OneTimeLog } from "./OneTimeLogger";
import { WebglDebugRenderer } from "../Renderers/DebugRenderer";
import { RenderConfigs } from "../Renderers/_RendererConfigs";
import { ICameraObserver, ICameraEventArgs, Camera } from "./CameraManager";
import { WebglPostRenderer } from "../Renderers/PostRenderer";
import { WebglLightingRenderer } from "../Renderers/LightingRenderer";
import { WebglMixRenderer } from "../Renderers/MixRenderer";

//@ts-ignore
const glMatrix = window.glMatrix;
const GetEmptyMatrix = (): Float32Array => new Float32Array(16);
const GetEmptyMatrix2D = (): Float32Array => {
    const empty = GetEmptyMatrix();
    empty[0] = 1;
    empty[5] = 1;
    empty[10] = 1;
    empty[15] = 1;
    return empty;
}

class RenderingPipeline implements ICameraObserver {
    private _context: WebGLRenderingContext;
    private _renderers: { [key: string]: WebglRenderer } = {}

    Init(canvas: HTMLCanvasElement): void {
        let gl = canvas.getContext('webgl');

        if (!gl) {
            Log.Warn('Browser does not support WebGL, moving to experimental.');
            //@ts-ignore Doesn't recognize 'experimental-webgl'
            gl = canvas.getContext('experimental-webgl');
        }

        if (!gl) {
            Log.Error('Browser does not support any form of WebGL. Aborting Rendering Pipeline initialization.');
            return;
        }

        Camera.Subscribe(this);
        this._context = gl;
        this._renderers.scene = new WebglSceneRenderer(canvas, RenderConfigs.scene, Images.GetImageArray());
        this._renderers.debug = new WebglDebugRenderer(canvas, RenderConfigs.debug);
        this._renderers.post = new WebglPostRenderer(canvas, RenderConfigs.post);
        this._renderers.lighting = new WebglLightingRenderer(canvas, RenderConfigs.lighting);
        this._renderers.mix = new WebglMixRenderer(canvas, RenderConfigs.mix);

        const empty = GetEmptyMatrix()
        let viewMatrix = GetEmptyMatrix();
        glMatrix.mat4.lookAt(viewMatrix, [0, 0, 900], [0, 0, 0], [0, 1, 0]);

        this.SetUniformData('scene', 'u_viewMatrix', [false, viewMatrix])
        this.SetUniformData('scene', 'u_worldMatrix', [false, empty]);
        this.SetUniformData('scene', 'u_projectionMatrix', [false, empty]);

        this.SetUniformData('debug', 'u_viewMatrix', [false, viewMatrix])
        this.SetUniformData('debug', 'u_worldMatrix', [false, empty]);
        this.SetUniformData('debug', 'u_projectionMatrix', [false, empty]);

        this.SetUniformData('lighting', 'u_viewMatrix', [false, viewMatrix])
        this.SetUniformData('lighting', 'u_worldMatrix', [false, empty]);
        this.SetUniformData('lighting', 'u_projectionMatrix', [false, empty]);

        this.SetUniformData('post', 'u_offsetPower', [0]);
    }

    OnObservableNotified(args: ICameraEventArgs): void {
        if (!this._context) return;

        const worldMatrix = GetEmptyMatrix2D();
        glMatrix.mat4.rotate(worldMatrix, worldMatrix, args.transform.RotationRadian, [0, 0, 1]);
        glMatrix.mat4.translate(worldMatrix, worldMatrix, [-args.transform.Position[0], -args.transform.Position[1], 0]);
        this.SetUniformData('scene', 'u_worldMatrix', [false, worldMatrix]);
        this.SetUniformData('debug', 'u_worldMatrix', [false, worldMatrix]);
        this.SetUniformData('lighting', 'u_worldMatrix', [false, worldMatrix]);

        const projectionMatrix = GetEmptyMatrix();
        glMatrix.mat4.ortho(projectionMatrix, args.transform.Scale[0] / -2, args.transform.Scale[0] / 2, args.transform.Scale[1] / -2, args.transform.Scale[1] / 2, args.nearFar[0], args.nearFar[1]);
        this.SetUniformData('scene', 'u_projectionMatrix', [false, projectionMatrix]);
        this.SetUniformData('debug', 'u_projectionMatrix', [false, projectionMatrix]);
        this.SetUniformData('lighting', 'u_projectionMatrix', [false, projectionMatrix]);
    }

    Render(): void {
        if (!this._context) {
            OneTimeLog.Log('no_rendering_context', 'Rendering pipeline does not have a rendering context. Aborting render calls.', LogLevel.Error);
            return;
        }
        const gl = this._context;

        gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
        
        gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, (this._renderers.mix as WebglMixRenderer).FrameBuffer1);
        gl.clearColor(0.2, 0.2, 0.2, 1);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
        this._renderers.scene.Render();
        
        gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, (this._renderers.mix as WebglMixRenderer).FrameBuffer2);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
        this._renderers.lighting.Render();

        
        gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, (this._renderers.post as WebglPostRenderer).FrameBuffer);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
        this._renderers.mix.Render();
        
        gl.bindFramebuffer(WebGLRenderingContext.FRAMEBUFFER, null);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
        this._renderers.post.Render();
        gl.clear(WebGLRenderingContext.DEPTH_BUFFER_BIT);
        this._renderers.debug.Render();
    }

    private CheckExists(rendererName: string): boolean {
        if (!this._renderers[rendererName]) {
            OneTimeLog.Log(`no_renderer_named_${rendererName}`, `No renderer named '${rendererName}' defined.`, LogLevel.Error);
            return false;
        }
        return true;
    }

    SetDrawData(rendererName: string, data: any): void {
        if (!this.CheckExists(rendererName)) return;
        this._renderers[rendererName].SetDrawData(data);
    }

    SetUniformData(rendererName: string, uniformName: string, data: any): void {
        if (!this.CheckExists(rendererName)) return;
        this._renderers[rendererName].SetUniformData(uniformName, data);
    }
}

export const Rendering = new RenderingPipeline();