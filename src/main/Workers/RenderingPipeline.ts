import { WebglRenderer } from "../Renderers/BaseRenderer";
import { WebglSceneRenderer } from "../Renderers/SceneRenderer";
import { Images } from "./ImageManager";
import { Log, LogLevel } from "./Logger";
import { OneTimeLog } from "./OneTimeLogger";
import { WebglDebugRenderer } from "../Renderers/DebugRenderer";
import { RenderConfigs } from "../Renderers/_RendererConfigs";
import { Camera } from "./CameraManager";
import { WebglPostRenderer } from "../Renderers/PostRenderer";
import { WebglLightingRenderer } from "../Renderers/LightingRenderer";
import { WebglMixRenderer } from "../Renderers/MixRenderer";
import { ITransformObserver, ITransformEventArgs } from "../Models/Transform";
import { Config } from "../Proxies/ConfigProxy";

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

interface IRenderersContainer {
    scene: WebglSceneRenderer;
    ui: WebglSceneRenderer;
    debug: WebglDebugRenderer;
    post: WebglPostRenderer;
    lighting: WebglLightingRenderer;
    mix: WebglMixRenderer;
}

class RenderingPipeline implements ITransformObserver {
    private _context: WebGLRenderingContext;
    private _renderers: IRenderersContainer;

    Init(canvas: HTMLCanvasElement): void {
        let gl = canvas.getContext('webgl2', { alpha: false });
        if (!gl) {
            Log.Warn('Browser does not support WebGL2, trying experimental.');
            //@ts-ignore Not recognized by TS
            gl = canvas.getContext('experimental-webgl2', {alpha:false});
        }

        if (!gl) {
            Log.Error('Browser does not support any form of WebGL2.');
            return;
        }

        Camera.Transform.Subscribe(this);
        this._context = gl;
        this._renderers = {
            scene: new WebglSceneRenderer(canvas, RenderConfigs.scene, Images.GetImageArray()),
            ui: new WebglSceneRenderer(canvas, RenderConfigs.ui, Images.GetImageArray()),
            debug: new WebglDebugRenderer(canvas, RenderConfigs.debug),
            post: new WebglPostRenderer(canvas, RenderConfigs.post),
            lighting: new WebglLightingRenderer(canvas, RenderConfigs.lighting),
            mix: new WebglMixRenderer(canvas, RenderConfigs.mix),
        };

        const empty = GetEmptyMatrix()
        let viewMatrix = GetEmptyMatrix();
        glMatrix.mat4.lookAt(viewMatrix, [0, 0, 900], [0, 0, 0], [0, 1, 0]);

        this.SetUniformData(['scene', 'debug', 'lighting', 'ui'], 'u_viewMatrix', [false, viewMatrix]);
        this.SetUniformData(['scene', 'debug', 'lighting', 'ui'], 'u_projectionMatrix', [false, empty]);
        this.SetUniformData(['scene', 'debug', 'lighting'], 'u_worldMatrix', [false, empty]);
        this.SetUniformData(['ui', 'post'], 'u_brightness', [1]);

        this.ResetClearColor();
    }

    OnObservableNotified(args: ITransformEventArgs): void {
        if (!this._context) return;

        const worldMatrix = GetEmptyMatrix2D();
        glMatrix.mat4.rotate(worldMatrix, worldMatrix, Camera.Transform.RotationRadian, [0, 0, 1]);
        glMatrix.mat4.translate(worldMatrix, worldMatrix, [-Camera.Transform.Position[0], -Camera.Transform.Position[1], 0]);
        this.SetUniformData(['scene', 'debug', 'lighting'], 'u_worldMatrix', [false, worldMatrix]);

        const projectionMatrix = GetEmptyMatrix();
        glMatrix.mat4.ortho(projectionMatrix, Camera.Transform.Scale[0] / -2, Camera.Transform.Scale[0] / 2, Camera.Transform.Scale[1] / -2, Camera.Transform.Scale[1] / 2, Camera.NearFar[0], Camera.NearFar[1]);
        this.SetUniformData(['scene', 'debug', 'lighting', 'ui'], 'u_projectionMatrix', [false, projectionMatrix]);
    }

    private UnbindBuffers() {
        this._context.bindRenderbuffer(this._context.RENDERBUFFER, null);
        this._context.bindFramebuffer(this._context.FRAMEBUFFER, null);
    }

    private ResetClearColor() {
        this._context.clearColor(0, 0, 0, 1);
    }

    Render(): void {
        if (!this._context) {
            OneTimeLog.Log('no_rendering_context', 'Rendering pipeline does not have a rendering context. Aborting render calls.', LogLevel.Error);
            return;
        }
        const gl = this._context;

        // Render the scene into the mix scene buffer
        this._renderers.mix.BindToSceneBuffer();
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
        this._renderers.scene.Render();

        // Render the lighting into the mix lighting buffer
        this._renderers.mix.BindToLightBuffer();
        gl.clearColor(0, 0, 0, 1);
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
        this._renderers.lighting.Render();

        // Render the scene and lighting together into the post buffer
        this._renderers.post.BindToBuffer();
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
        this._renderers.mix.Render();

        // Render post processing result on to the canvas
        this.UnbindBuffers();
        gl.clear(WebGLRenderingContext.COLOR_BUFFER_BIT | WebGLRenderingContext.DEPTH_BUFFER_BIT);
        this._renderers.post.Render();
        this.ResetClearColor();

        // Render the UI on to the canvas
        gl.clear(WebGLRenderingContext.DEPTH_BUFFER_BIT);
        this._renderers.ui.Render();

        if (Config.GetConfig('debugDraw', false)) {
            // Render debug data ontp the canvas
            gl.clear(WebGLRenderingContext.DEPTH_BUFFER_BIT);
            this._renderers.debug.Render();
        }
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

    SetUniformData(rendererName: string | string[], uniformName: string, data: any): void {
        if (typeof (rendererName) == 'string') {
            if (this.CheckExists(rendererName))
                this._renderers[rendererName].SetUniformData(uniformName, data);
        }
        else
            rendererName.forEach(r => this.SetUniformData(r, uniformName, data));
    }
}

export const Rendering = new RenderingPipeline();