var gl;
const GetEmptyMatrix = () => new Float32Array(16);
const GetEmptyMatrix2D = () => {
    const empty = GetEmptyMatrix();
    empty[0] = 1;
    empty[5] = 1;
    empty[10] = 1;
    empty[15] = 1;
    return empty;
}

const webglDef = {
    _debug: true,
    _width: 800,
    _heigh: 800,
    _clearColor: [0.2, 0.2, 0.2, 1.0],
    _running: true,
    _spriteSheet: null,
    program: null,

    _camera: {
        frustum: {
            horizontal: 0,
            vertical: 0,
            near: 0,
            far: 0,
        },
        position: [0, 0],
        radians: 0 // Radian
    },

    attributes: {},
    uniforms: {},
    buffers: {
        vertexes: null,
        indexes: null,
    },

    init: (vertexSource, fragmentSource, cvs, spriteSheet) => {
        cvs.width = webglDef._width;
        cvs.heigh = webglDef._heigh;

        gl = cvs.getContext('webgl');

        if (!gl) {
            console.warn('Browser does not support WebGL, moving to experimental.');
            gl = canvas.getContext('experimental-webgl');
        }

        if (!gl) {
            console.error('Browser does not support any form of WebGL.');
            window.warn('Your browser does not support WebGL.');
            return false;
        }

        const vertextShader = gl.createShader(gl.VERTEX_SHADER);
        gl.shaderSource(vertextShader, vertexSource);
        gl.compileShader(vertextShader);

        const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
        gl.shaderSource(fragmentShader, fragmentSource);
        gl.compileShader(fragmentShader);

        {
            const vertexStatus = gl.getShaderParameter(vertextShader, gl.COMPILE_STATUS);
            if (!vertexStatus)
                console.error('Vertex shader compilation error.', gl.getShaderInfoLog(vertextShader));

            const fragmentStatus = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
            if (!fragmentStatus)
                console.error('Fragment shader compilation error.', gl.getShaderInfoLog(fragmentShader));

            if (!vertexStatus || !fragmentStatus)
                return false;
        }

        gl.clearColor(...webglDef._clearColor);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.enable(gl.DEPTH_TEST);
        gl.enable(gl.CULL_FACE);
        gl.frontFace(gl.CCW);
        gl.cullFace(gl.BACK);

        const program = gl.createProgram();
        webglDef.program = program;

        gl.attachShader(program, vertextShader);
        gl.attachShader(program, fragmentShader);

        gl.linkProgram(program);
        if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
            console.error('Program linking failed.', gl.getProgramInfoLog(program));
            return;
        }

        if (webglDef._debug) {
            gl.validateProgram(program);
            if (!gl.getProgramParameter(program, gl.VALIDATE_STATUS)) {
                console.error('Program validation failed.', gl.getProgramInfoLog(program));
                return;
            }
        }

        webglDef.buffers.vertexes = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, webglDef.buffers.vertexes);

        webglDef.buffers.indexes = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, webglDef.buffers.indexes);

        const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');
        gl.vertexAttribPointer(
            positionAttributeLocation, // Attribute locaction
            3, // # of elements per attribute
            gl.FLOAT, // Element type
            gl.FALSE, // Normalize data?
            9 * Float32Array.BYTES_PER_ELEMENT, // element size in memory
            0
        );
        gl.enableVertexAttribArray(positionAttributeLocation);

        const rotationAttributeLocation = gl.getAttribLocation(program, 'a_rotation');
        gl.vertexAttribPointer(
            rotationAttributeLocation, // Attribute locaction
            2, // # of elements per attribute
            gl.FLOAT, // Element type
            gl.FALSE, // Normalize data?
            9 * Float32Array.BYTES_PER_ELEMENT, // element size in memory
            3 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(rotationAttributeLocation);

        const offsetAttributeLocation = gl.getAttribLocation(program, 'a_offset');
        gl.vertexAttribPointer(
            offsetAttributeLocation, // Attribute locaction
            2, // # of elements per attribute
            gl.FLOAT, // Element type
            gl.FALSE, // Normalize data?
            9 * Float32Array.BYTES_PER_ELEMENT, // element size in memory
            5 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(offsetAttributeLocation);

        const texCoordAttributeLocation = gl.getAttribLocation(program, 'a_texCoord');
        gl.vertexAttribPointer(
            texCoordAttributeLocation, // Attribute locaction
            2, // # of elements per attribute
            gl.FLOAT, // Element type
            gl.FALSE, // Normalize data?
            9 * Float32Array.BYTES_PER_ELEMENT, // element size in memory
            7 * Float32Array.BYTES_PER_ELEMENT
        );
        gl.enableVertexAttribArray(texCoordAttributeLocation);

        webglDef._spriteSheet = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, webglDef._spriteSheet);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, spriteSheet);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.useProgram(program);

        webglDef.uniforms.worldMatrix = gl.getUniformLocation(program, 'u_worldMatrix');
        webglDef.uniforms.projectionMatrix = gl.getUniformLocation(program, 'u_projectionMatrix');
        webglDef.uniforms.viewMatrix = gl.getUniformLocation(program, 'u_viewMatrix');

        const worldMatrix = GetEmptyMatrix();
        const projectionMatrix = GetEmptyMatrix();
        const viewMatrix = GetEmptyMatrix();

        glMatrix.mat4.identity(worldMatrix);
        glMatrix.mat4.lookAt(viewMatrix, [0, 0, 100], [0, 0, 0], [0, 1, 0]);
        glMatrix.mat4.ortho(projectionMatrix, cvs.width / -2, cvs.width / 2, cvs.height / -2, cvs.height / 2, 0.1, 1000);
        // glMatrix.mat4.perspective(projectionMatrix, glMatrix.glMatrix.toRadian(90), cvs.width / cvs.height, 0.1, 1000);


        gl.uniformMatrix4fv(webglDef.uniforms.worldMatrix, gl.FALSE, worldMatrix);
        gl.uniformMatrix4fv(webglDef.uniforms.projectionMatrix, gl.FALSE, projectionMatrix);
        gl.uniformMatrix4fv(webglDef.uniforms.viewMatrix, gl.FALSE, viewMatrix);

        webglDef.setCameraFrustum(cvs.clientWidth / 50, cvs.clientHeight / 50, 0.1, 1000);
        webglDef.setCameraTranslation(0, 0);
        webglDef.setCameraRotation(0);


        gl.bindTexture(gl.TEXTURE_2D, webglDef._spriteSheet);
        gl.activeTexture(gl.TEXTURE0);

        return true;
    },

    setCameraFrustum: (horizontal = null, vertical = null, near = null, far = null) => {
        const frust = webglDef._camera.frustum;
        frust.horizontal = horizontal == null ? frust.horizontal : horizontal;
        frust.vertical = vertical == null ? frust.vertical : vertical;
        frust.near = near == null ? frust.near : near;
        frust.far = far == null ? frust.far : far;

        const matrix = GetEmptyMatrix();
        glMatrix.mat4.ortho(matrix, frust.horizontal / -2, frust.horizontal / 2, frust.vertical / -2, frust.vertical / 2, frust.near, frust.far);
        gl.uniformMatrix4fv(webglDef.uniforms.projectionMatrix, gl.FALSE, matrix);
    },

    translateCamera: (x = 0, y = 0) => webglDef.setCameraTranslation(webglDef._camera.x + x, webglDef._camera.y + y),
    setCameraTranslation: (x = null, y = null) => {
        const cam = webglDef._camera;
        cam.x = x == null ? cam.x : x;
        cam.y = y == null ? cam.y : y;
        webglDef._updateCameraTransform();
    },

    rotateCamera: (degrees) => webglDef.setCameraRotation((webglDef._camera.radians * 180 / Math.PI) + degrees),
    setCameraRotation: (degrees) => {
        webglDef._camera.radians = glMatrix.glMatrix.toRadian(degrees);
        webglDef._updateCameraTransform();
    },

    _updateCameraTransform: () => {
        const matrix = GetEmptyMatrix2D();
        glMatrix.mat4.rotate(matrix, matrix, webglDef._camera.radians, [0, 0, 1]);
        glMatrix.mat4.translate(matrix, matrix, [webglDef._camera.x, webglDef._camera.y, 0]);
        gl.uniformMatrix4fv(webglDef.uniforms.worldMatrix, gl.False, matrix);
    },

    draw: (vertexes, indexes) => {
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexes), gl.DYNAMIC_DRAW);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexes), gl.DYNAMIC_DRAW);

        // webglDef.translateCamera(0.01, 0.01);
        // webglDef.rotateCamera(1);

        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
        gl.drawElements(gl.TRIANGLES, indexes.length, gl.UNSIGNED_SHORT, 0)
    }
}
