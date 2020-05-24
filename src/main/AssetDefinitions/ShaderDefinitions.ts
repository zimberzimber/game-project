export const ShaderSources = {
    scene_vertex: `
precision mediump float;

attribute vec3 a_position;
attribute vec2 a_texCoord;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

varying vec2 v_texCoord;

void main() {
    v_texCoord = a_texCoord;
    gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_position, 1.);
}`,

    scene_fragment: `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_sampler;

void main() {
    gl_FragColor = texture2D(u_sampler, v_texCoord);
}`,

    debug_vertex: `
precision mediump float;

attribute vec2 a_position;
attribute float a_colorIndex;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

varying float v_colorIndex;

void main() {
    v_colorIndex = a_colorIndex;
    gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_position, 1., 1.);
}`,

    debug_fragment: `
precision mediump float;

varying float v_colorIndex;

void main() {
    if (v_colorIndex == 1.)
        { gl_FragColor = vec4(1., 0., 0., 1.); }
    else
        { gl_FragColor = vec4(1., 1., 0., 1.); }
}`,

};
