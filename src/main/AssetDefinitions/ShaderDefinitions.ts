export const ShaderSources = {
    scene_vertex: `#version 300 es
precision mediump float;

in vec3 a_position;
in vec2 a_texCoord;
in float a_opacity;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

out vec2 v_texCoord;
out float v_opacity;

void main() {
    v_texCoord = a_texCoord;
    v_opacity = a_opacity;
    gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_position, 1.);
}`,

    scene_fragment: `#version 300 es
precision mediump float;

uniform sampler2D u_sampler;

in vec2 v_texCoord;
in float v_opacity;

out vec4 outColor;

void main() {
    vec2 coord = v_texCoord / vec2(textureSize(u_sampler, 0));

    vec4 color = texture(u_sampler, coord);
    if (color.a == 0.) discard;

    outColor = texture(u_sampler, coord);
    outColor.a *= v_opacity;
}`,

    debug_vertex: `#version 300 es
precision mediump float;

in vec2 a_position;
in float a_colorIndex;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

out float v_colorIndex;

void main() {
    v_colorIndex = a_colorIndex;
    gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_position, 1., 1.);
}`,

    debug_fragment: `#version 300 es
precision mediump float;

in float v_colorIndex;

out vec4 fragColor;

void main() {
    if (v_colorIndex == 1.)
        { fragColor = vec4(1., 0., 0., 1.); }
    else
        { fragColor = vec4(1., 1., 0., 1.); }
}`,


    post_vertex: `#version 300 es
precision mediump float;

in vec4 a_position;

out vec2 v_texCoord;

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

    post_fragment: `#version 300 es
precision mediump float;

uniform sampler2D u_sampler;
uniform float u_offsetPower;

in vec2 v_texCoord;

out vec4 fragColor;

void main() {
    vec4 color = texture(u_sampler, v_texCoord);
    color.r = texture(u_sampler, v_texCoord + vec2(u_offsetPower, 0.)).r;
    color.b = texture(u_sampler, v_texCoord - vec2(u_offsetPower, 0.)).b;
    fragColor = color;
}`,

    mix_vertex: `#version 300 es
precision mediump float;

in vec4 a_position;

out vec2 v_texCoord;

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

    mix_fragment: `#version 300 es
precision mediump float;

uniform sampler2D u_sampler_0;
uniform sampler2D u_sampler_1;

in vec2 v_texCoord;

out vec4 fragColor;

void main() {
    fragColor = texture(u_sampler_0, v_texCoord) * texture(u_sampler_1, v_texCoord);
}`,

    // Resolution extraction from projection matrix:
    // https://stackoverflow.com/a/12926655
    lighting_vertex: `#version 300 es
precision mediump float;

in vec2 a_position;
in vec2 a_origin;
in vec3 a_color;
in float a_radius;
in float a_hardness;
in float a_direction;
in float a_angle;

uniform mat4 u_worldMatrix;
uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

out vec2 v_origin;
out vec3 v_color;
out float v_radius;
out float v_hardness;
out float v_direction;
out float v_angle;

void main() {
    v_color = a_color;
    v_radius = a_radius;
    v_hardness = a_hardness;
    v_direction = a_direction;
    v_angle = a_angle;

    gl_Position = u_projectionMatrix * u_viewMatrix * u_worldMatrix * vec4(a_position, 1., 1.);

    vec2 half_resolution = vec2(
        (1. - u_projectionMatrix[0][3]) / u_projectionMatrix[0][0],
        (1. - u_projectionMatrix[1][3]) / u_projectionMatrix[1][1]);
    
    v_origin += (u_worldMatrix * vec4(a_origin, 1., 1.)).xy + half_resolution;
}`,

    lighting_fragment: `#version 300 es
precision mediump float;
#define PI 3.1415926538

in vec2 v_origin;
in vec3 v_color;
in float v_radius;
in float v_hardness;
in float v_direction;
in float v_angle;

out vec4 fragColor;

bool IsInFrustum(float radian) {
    float angle = radian * 180. / PI;
    float min = v_direction - v_angle / 2.;
    float max = v_direction + v_angle / 2.;

    if (max >= 360.) {
        min -= 360.;
        max -= 360.;
    }
    else if (max >= 180.) {
        angle = mod(angle, 360.);
    }
    else if (min <= -360.) {
        min += 360.;
        max += 360.;
    }
    else if (min <= -180.) {
        angle = mod(angle, -360.);
    }

    if (angle >= min && angle <= max)
        return true;

    return false;
}

void main() {
    float dist = distance(gl_FragCoord.xy, v_origin);
    if (dist > v_radius)
        discard;

    float radian = atan(gl_FragCoord.y - v_origin.y, gl_FragCoord.x - v_origin.x);
    if (v_angle < 360. && !IsInFrustum(radian))
        discard;

    float alpha = 1.;
    float min_distance = v_radius * v_hardness;

    if (dist > min_distance)
    {
        vec2 p2 = vec2(v_origin.x + cos(radian) * min_distance, v_origin.y + sin(radian) * min_distance);
        float dist2 = distance(gl_FragCoord.xy, p2);
        alpha = smoothstep(1., 0., dist2 / (v_radius - min_distance));
    }

    fragColor = vec4(v_color, alpha);
}`,

    ui_vertex: `#version 300 es
precision mediump float;

uniform mat4 u_viewMatrix;
uniform mat4 u_projectionMatrix;

in vec3 a_position;
in vec2 a_texCoord;
in float a_opacity;

out vec2 v_texCoord;
out float v_opacity;

void main() {
    v_texCoord = a_texCoord;
    v_opacity = a_opacity;
    gl_Position = u_projectionMatrix * u_viewMatrix * vec4(a_position, 1.);
}`,
};
