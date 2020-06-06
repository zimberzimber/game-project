import { Log } from "../Workers/Logger";
import { IRendererAttributeContainer, IRendererUniformContainer, IRendererConfig } from "./_RendererInterfaces";

export abstract class WebglRenderer {
    private static _nextTextureId: number = 0;
    protected _context: WebGLRenderingContext;
    protected _program: WebGLProgram;
    protected _attributes: { [key: string]: IRendererAttributeContainer } = {};
    protected _uniforms: { [key: string]: IRendererUniformContainer } = {};
    protected _attributeBuffer: WebGLBuffer;
    protected _indexBuffer: WebGLBuffer;

    constructor(canvas: HTMLCanvasElement, config: IRendererConfig) {
        let gl = canvas.getContext('webgl');
        {
            if (!gl) {
                Log.Warn('Browser does not support WebGL, moving to experimental.');
                //@ts-ignore Not recognized by TS
                gl = canvas.getContext('experimental-webgl');
            }

            if (!gl) {
                Log.Error('Browser does not support any form of WebGL.');
                return;
            }
        }

        this._context = gl;

        const vertextShader = gl.createShader(gl.VERTEX_SHADER);
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        {
            if (!vertextShader) Log.Error('Faied creating vertex shader. Terminating WebGL initialization.');
            if (!fragmentShader) Log.Error('Faied creating fragment shader. Terminating WebGL initialization.');
            if (!vertextShader || !fragmentShader) return;

            gl.shaderSource(vertextShader, config.vertexSource);
            gl.compileShader(vertextShader);

            gl.shaderSource(fragmentShader, config.fragmentSource);
            gl.compileShader(fragmentShader);

            const vertexStatus = gl.getShaderParameter(vertextShader, gl.COMPILE_STATUS);
            if (!vertexStatus) {
                Log.Error(`Vertex shader compilation error.`);
                Log.Error(gl.getShaderInfoLog(vertextShader));
            }

            const fragmentStatus = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
            if (!fragmentStatus) {
                Log.Error(`Fragment shader compilation error.`);
                Log.Error(gl.getShaderInfoLog(fragmentShader));
            }

            if (!vertexStatus || !fragmentStatus) return;
        }

        // Enabling certain settings
        {
            //@ts-ignore Weird case where typescript refused to aknowledge the spread operator
            // gl.clearColor(...this._clearColor);
            // gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
            gl.enable(gl.DEPTH_TEST);
            gl.enable(gl.CULL_FACE);
            gl.frontFace(gl.CCW);
            gl.cullFace(gl.BACK);

            gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
            gl.enable(gl.BLEND);
        }

        //@ts-ignore Can't be null
        this._program = gl.createProgram();
        const program = this._program;
        {
            gl.attachShader(program, vertextShader);
            gl.attachShader(program, fragmentShader);

            gl.linkProgram(program);
            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                Log.Error('Failed linking WebGL program. Terminationg initialization.');
                Log.Error(gl.getProgramInfoLog(program));
                return;
            }

            // if (this._debug) {
            //     gl.validateProgram(program);
            //     if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
            //         Log.Error('Failed validaating WebGL program. Terminationg initialization.');
            //         Log.Error(gl.getProgramInfoLog(program));
            //         return;
            //     }
            // }
        }

        this._attributeBuffer = gl.createBuffer()!;
        this._indexBuffer = gl.createBuffer()!;

        for (const attribute in config.attributes) {
            this._attributes[attribute] = {
                index: gl.getAttribLocation(program, attribute),
                definition: config.attributes[attribute]
            };
        }

        for (const uniform in config.uniforms) {
            this._uniforms[uniform] = {
                index: gl.getUniformLocation(program, uniform)!,
                type: config.uniforms[uniform],
                data: []
            };
        }
    }

    SetUniformData(uniformName: string, data: any[]): void {
        this._uniforms[uniformName].data = data;
    }

    protected ActivateProgram() {
        const gl = this._context;
        gl.useProgram(this._program);

        gl.bindBuffer(gl.ARRAY_BUFFER, this._attributeBuffer);
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._indexBuffer);

        for (const attribute in this._attributes) {
            gl.vertexAttribPointer(
                this._attributes[attribute].index,
                this._attributes[attribute].definition.size,
                this._attributes[attribute].definition.type,
                this._attributes[attribute].definition.normalized,
                this._attributes[attribute].definition.stride,
                this._attributes[attribute].definition.offset
            );
            gl.enableVertexAttribArray(this._attributes[attribute].index);
        }

        // Hack (verb): Cut with rough, or heavy blows.
        for (const uniform in this._uniforms) {
            gl[`uniform${this._uniforms[uniform].type}`](this._uniforms[uniform].index, ...this._uniforms[uniform].data);
        }
    }

    protected get NextTextureId(): number {
        return WebglRenderer._nextTextureId++;
    }

    abstract SetDrawData(data: any): void;
    abstract Render(): void;
}