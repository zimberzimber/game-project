import { Log } from "./Logger";
import { Vec2 } from "../Models/Vec2";
import { WebglDrawData } from "../Models/WebglDrawData";

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

class WebglManager {
    private _debug: boolean = false;
    private _width: number = 800;
    private _height: number = 800;
    private _clearColor: number[] = [0.2, 0.2, 0.2, 1.0];
    private _textureArray: WebGLTexture | null[] = [];
    private _program: WebGLProgram;
    private _gl: WebGLRenderingContext;

    private _camera: { frustum: { horizontal: number, vertical: number, near: number, far: number, }, position: Vec2, radians: number } = {
        frustum: {
            horizontal: 0,
            vertical: 0,
            near: 0,
            far: 0,
        },
        position: [0, 0],
        radians: 0,
    };

    private _uniforms: { worldMatrix: WebGLUniformLocation | null, projectionMatrix: WebGLUniformLocation | null, viewMatrix: WebGLUniformLocation | null, } = {
        worldMatrix: null,
        projectionMatrix: null,
        viewMatrix: null,
    };

    private _buffers: { vertexes: WebGLBuffer | null, indexes: WebGLBuffer | null, } = {
        vertexes: null, indexes: null,
    };

    private _drawData: { triangles: { vertexes: number[], indexes: number[], }, lines: WebglDrawData[], } = {
        triangles: {
            vertexes: [],
            indexes: []
        },
        lines: []
    };


    Init(vertexSource: string, fragmentSource: string, canvas: HTMLCanvasElement, imagesArray: HTMLImageElement[]): void {
        if (this._gl) {
            Log.Warn('WebGL is already initialized.');
            return;
        }

        canvas.width = this._width;
        canvas.height = this._height;

        let gl = canvas.getContext('webgl');

        if (!gl) {
            Log.Warn('Browser does not support WebGL, moving to experimental.');
            //@ts-ignore 
            gl = canvas.getContext('experimental-webgl');
        }

        if (!gl) {
            Log.Error('Browser does not support any form of WebGL.');
            return;
        }

        this._gl = gl;

        const vertextShader = gl.createShader(gl.VERTEX_SHADER);
        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);

        if (!vertextShader) Log.Error('Faied creating vertex shader. Terminating WebGL initialization.');
        if (!fragmentShader) Log.Error('Faied creating fragment shader. Terminating WebGL initialization.');
        if (!vertextShader || !fragmentShader) return;

        gl.shaderSource(vertextShader, vertexSource);
        gl.compileShader(vertextShader);

        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);

        {
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

        //@ts-ignore Weird case where typescript refused to aknowledge the spread operator
        gl.clearColor(...this._clearColor);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);

        //@ts-ignore Can't be null
        this._program = gl.createProgram();
        const program = this._program;

        gl.attachShader(program, vertextShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            Log.Error('Failed linking WebGL program. Terminationg initialization.');
            Log.Error(gl.getProgramInfoLog(program));
            return;
        }

        if (this._debug) {
            gl.validateProgram(program);
            if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
                Log.Error('Failed validaating WebGL program. Terminationg initialization.');
                Log.Error(gl.getProgramInfoLog(program));
                return;
            }
        }

        this._buffers.vertexes = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this._buffers.vertexes);

        this._buffers.indexes = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this._buffers.indexes);

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        gl.vertexAttribPointer(
            positionAttributeLocation, // Attribute locaction
            3, // # of elements per attribute
            gl.FLOAT, // Element type
            false, // Normalize data?
            9 * Float32Array.BYTES_PER_ELEMENT, // element size in memory
            0
        );
        gl.enableVertexAttribArray(positionAttributeLocation);

        const rotationAttributeLocation = gl.getAttribLocation(program, 'a_rotation');
        gl.vertexAttribPointer(
            rotationAttributeLocation, // Attribute locaction
            2, // # of elements per attribute
            gl.FLOAT, // Element type
            false, // Normalize data?
            9 * Float32Array.BYTES_PER_ELEMENT, // element size in memory
            3 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(rotationAttributeLocation);

        const offsetAttributeLocation = gl.getAttribLocation(program, 'a_offset');
        gl.vertexAttribPointer(
            offsetAttributeLocation, // Attribute locaction
            2, // # of elements per attribute
            gl.FLOAT, // Element type
            false, // Normalize data?
            9 * Float32Array.BYTES_PER_ELEMENT, // element size in memory
            5 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(offsetAttributeLocation);

        const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');
        gl.vertexAttribPointer(
            texCoordAttributeLocation, // Attribute locaction
            2, // # of elements per attribute
            gl.FLOAT, // Element type
            false, // Normalize data?
            9 * Float32Array.BYTES_PER_ELEMENT, // element size in memory
            7 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(texCoordAttributeLocation);

        for (let i = 0; i < imagesArray.length; i++) {
            this._textureArray[i] = gl.createTexture();

            gl.bindTexture(gl.TEXTURE_2D, this._textureArray[i]);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

            gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, imagesArray[i]);
            // gl.bindTexture(gl.TEXTURE_2D, null);
        }

        gl.useProgram(program);

        this._uniforms.worldMatrix = gl.getUniformLocation(program, 'u_worldMatrix');
        this._uniforms.projectionMatrix = gl.getUniformLocation(program, 'u_projectionMatrix');
        this._uniforms.viewMatrix = gl.getUniformLocation(program, 'u_viewMatrix');

        const worldMatrix = GetEmptyMatrix();
        const projectionMatrix = GetEmptyMatrix();
        const viewMatrix = GetEmptyMatrix();

        glMatrix.mat4.identity(worldMatrix);
        glMatrix.mat4.lookAt(viewMatrix, [0, 0, 100], [0, 0, 0], [0, 1, 0]);
        //glMatrix.mat4.ortho(projectionMatrix, cvs.width / -2, cvs.width / 2, cvs.height / -2, cvs.height / 2, 0.1, 1000);
        // glMatrix.mat4.perspective(projectionMatrix, glMatrix.glMatrix.toRadian(90), cvs.width / cvs.height, 0.1, 1000);

        gl.uniformMatrix4fv(this._uniforms.worldMatrix, false, worldMatrix);
        gl.uniformMatrix4fv(this._uniforms.projectionMatrix, false, projectionMatrix);
        gl.uniformMatrix4fv(this._uniforms.viewMatrix, false, viewMatrix);

        this.SetCameraFrustum(canvas.clientWidth, canvas.clientHeight, 0.1, 1000);
        this.SetCameraTranslation(0, 0);
        this.SetCameraRotation(0);
    }

    SetCameraFrustum(horizontal: number | null = null, vertical: number | null = null, near: number | null = null, far: number | null = null) {
        const frust = this._camera.frustum;
        frust.horizontal = horizontal == null ? frust.horizontal : horizontal;
        frust.vertical = vertical == null ? frust.vertical : vertical;
        frust.near = near == null ? frust.near : near;
        frust.far = far == null ? frust.far : far;

        const matrix = GetEmptyMatrix();
        glMatrix.mat4.ortho(matrix, frust.horizontal / -2, frust.horizontal / 2, frust.vertical / -2, frust.vertical / 2, frust.near, frust.far);
        this._gl.uniformMatrix4fv(this._uniforms.projectionMatrix, false, matrix);
    }

    TranslateCamera(x: number = 0, y: number = 0) {
        this.SetCameraTranslation(this._camera[0] + x, this._camera[1] + y);
    }

    SetCameraTranslation(x: number | null = null, y: number | null = null) {
        this._camera[0] = x == null ? this._camera[0] : x;
        this._camera[1] = y == null ? this._camera[1] : y;
        this.UpdateCameraTransform();
    }

    RotateCamera(degrees: number) {
        this.SetCameraRotation((this._camera.radians * 180 / Math.PI) + degrees)
    }

    SetCameraRotation(degrees: number) {
        this._camera.radians = glMatrix.glMatrix.toRadian(degrees);
        this.UpdateCameraTransform();
    }

    private UpdateCameraTransform() {
        const matrix = GetEmptyMatrix2D();
        glMatrix.mat4.rotate(matrix, matrix, this._camera.radians, [0, 0, 1]);
        glMatrix.mat4.translate(matrix, matrix, [this._camera[0], this._camera[1], 0]);
        this._gl.uniformMatrix4fv(this._uniforms.worldMatrix, false, matrix);
    }

    Draw() {
        // gl.bindTexture(gl.TEXTURE_2D, webglDef._textureArray[Date.now()%2]);
        // gl.activeTexture(gl[`TEXTURE${0}`]);

        let verts = Array.from(this._drawData.triangles.vertexes);
        let inds = Array.from(this._drawData.triangles.indexes);

        // HEAVY impact
        // Funnily enough, pushing spread arrays is faster than concatenating them
        for (let i = 0; i < this._drawData.lines.length; i++) {
            verts.push(...this._drawData.lines[i].vertexes);
            inds.push(...this._drawData.lines[i].indexes);
        }

        const gl = this._gl;
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.DYNAMIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(inds), gl.DYNAMIC_DRAW);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, this._drawData.triangles.indexes.length, gl.UNSIGNED_SHORT, 0)

        let indexOffset = this._drawData.triangles.indexes.length;

        for (let i = 0; i < this._drawData.lines.length; i++) {
            const data = this._drawData.lines[i];
            gl.drawElements(gl.LINE_STRIP, data.indexes.length, gl.UNSIGNED_SHORT, Uint16Array.BYTES_PER_ELEMENT * indexOffset)
            indexOffset += data.indexes.length;
        }
    }

    set TriangleData(data: WebglDrawData) {
        this._drawData.triangles.vertexes = data.vertexes;
        this._drawData.triangles.indexes = data.indexes;
    }

    set LineData(data: WebglDrawData[]) {
        this._drawData.lines = data;
    }
}

export const Webgl: WebglManager = new WebglManager();