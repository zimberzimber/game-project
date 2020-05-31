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


    post_vertex: `
precision mediump float;

attribute vec4 a_position;

varying vec2 v_texCoord;

void main() {
    float xTex = 0.;
    if (a_position.x > 0.)
    { xTex = 1.; }

    float yTex = 0.;
    if (a_position.y > 0.)
    { yTex = 1.; }

    v_texCoord = vec2(xTex, yTex);
    gl_Position = a_position;
}`,

    post_fragment: `
precision mediump float;

varying vec2 v_texCoord;
uniform sampler2D u_sampler;
uniform float u_offsetPower;

float Distance(vec2 origin, vec2 point) { return abs(sqrt(pow(point.x - origin.x, 2.) + pow(point.y - origin.y, 2.))); }
float Distance(float x1, float y1, float x2,float  y2) { return abs(sqrt(pow(x2 - x1, 2.) + pow(y2 - y1, 2.))); }

float Flashlight()
{
    vec2 n_coord = vec2(gl_FragCoord.x, gl_FragCoord.y);
    
    const float radius = 200.;
    float d = Distance(vec2(300, 250), n_coord);
    if(d <= radius)
    {
        float d_norm = d * 1. / radius;
        return smoothstep(1., 0., d_norm);
    }
    
    return 0.;
}

void main() {
    vec4 color = texture2D(u_sampler, v_texCoord);
    color.r = texture2D(u_sampler, v_texCoord + vec2(u_offsetPower, 0.)).r;
    color.b = texture2D(u_sampler, v_texCoord - vec2(u_offsetPower, 0.)).b;
    color *= Flashlight();
    color.a = 1.;
    gl_FragColor = color;
}`,
};
