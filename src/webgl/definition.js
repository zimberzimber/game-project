shaderSources = {
    vertex: `
precision mediump float;

attribute vec3 a_position;
attribute vec2 a_rotation;
attribute vec2 a_offset;
attribute vec2 a_texCoord;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

varying vec2 v_texCoord;

// Offset
// Rotation
// Translation

void main() {
    v_texCoord = a_texCoord;

    vec3 rotatedPosition = vec3(
        a_offset.x * a_rotation.y + a_offset.y * a_rotation.x,
        a_offset.y * a_rotation.y - a_offset.x * a_rotation.x,
        1.
    );
    vec3 pos = rotatedPosition + a_position;

    if (a_position.z == 90.) {
        gl_Position = u_projectionMatrix * u_viewMatrix * vec4(pos, 1.);
    } else {
        gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(pos, 1.);
    }
}`,

    fragment: `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_sampler;

void main() {
  gl_FragColor = texture2D(u_sampler, v_texCoord);
}`,
};