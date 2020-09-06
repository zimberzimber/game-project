import { IRendererConfig } from "./_RendererInterfaces"
import { ShaderSources } from "../AssetDefinitions/ShaderDefinitions"

export const RenderConfigs: { [key: string]: IRendererConfig } = {
    scene: {
        vertexSource: ShaderSources.scene_vertex,
        fragmentSource: ShaderSources.scene_fragment,
        attributes: {
            a_position: {
                size: 3,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 6 * Float32Array.BYTES_PER_ELEMENT,
                offset: 0,
            },
            a_texCoord: {
                size: 2,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 6 * Float32Array.BYTES_PER_ELEMENT,
                offset: 3 * Float32Array.BYTES_PER_ELEMENT,
            },
            a_opacity: {
                size: 1,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 6 * Float32Array.BYTES_PER_ELEMENT,
                offset: 5 * Float32Array.BYTES_PER_ELEMENT,
            }
        },
        uniforms: {
            u_worldMatrix: 'Matrix4fv',
            u_projectionMatrix: 'Matrix4fv',
            u_viewMatrix: 'Matrix4fv',
        }
    },

    debug: {
        vertexSource: ShaderSources.debug_vertex,
        fragmentSource: ShaderSources.debug_fragment,
        attributes: {
            a_position: {
                size: 2,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 5 * Float32Array.BYTES_PER_ELEMENT,
                offset: 0,
            },
            a_color: {
                size: 3,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 5 * Float32Array.BYTES_PER_ELEMENT,
                offset: 2 * Float32Array.BYTES_PER_ELEMENT,
            },
        },
        uniforms: {
            u_worldMatrix: 'Matrix4fv',
            u_projectionMatrix: 'Matrix4fv',
            u_viewMatrix: 'Matrix4fv',
        }
    },

    post: {
        vertexSource: ShaderSources.post_vertex,
        fragmentSource: ShaderSources.post_fragment,
        attributes: {
            a_position: {
                size: 2,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 2 * Float32Array.BYTES_PER_ELEMENT,
                offset: 0,
            }
        },
        uniforms: {
            u_brightness: '1f',
        }
    },

    lighting: {
        vertexSource: ShaderSources.lighting_vertex,
        fragmentSource: ShaderSources.lighting_fragment,
        attributes: {
            a_position: {
                size: 2,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 11 * Float32Array.BYTES_PER_ELEMENT,
                offset: 0,
            },
            a_origin: {
                size: 2,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 11 * Float32Array.BYTES_PER_ELEMENT,
                offset: 2 * Float32Array.BYTES_PER_ELEMENT,
            },
            a_color: {
                size: 3,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 11 * Float32Array.BYTES_PER_ELEMENT,
                offset: 4 * Float32Array.BYTES_PER_ELEMENT,
            },
            a_radius: {
                size: 1,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 11 * Float32Array.BYTES_PER_ELEMENT,
                offset: 7 * Float32Array.BYTES_PER_ELEMENT,
            },
            a_hardness: {
                size: 1,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 11 * Float32Array.BYTES_PER_ELEMENT,
                offset: 8 * Float32Array.BYTES_PER_ELEMENT,
            },
            a_direction: {
                size: 1,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 11 * Float32Array.BYTES_PER_ELEMENT,
                offset: 9 * Float32Array.BYTES_PER_ELEMENT,
            },
            a_angle: {
                size: 1,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 11 * Float32Array.BYTES_PER_ELEMENT,
                offset: 10 * Float32Array.BYTES_PER_ELEMENT,
            }
        },
        uniforms: {
            u_worldMatrix: 'Matrix4fv',
            u_projectionMatrix: 'Matrix4fv',
            u_viewMatrix: 'Matrix4fv',
        }
    },

    mix: {
        vertexSource: ShaderSources.mix_vertex,
        fragmentSource: ShaderSources.mix_fragment,
        attributes: {
            a_position: {
                size: 2,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 2 * Float32Array.BYTES_PER_ELEMENT,
                offset: 0,
            }
        },
        uniforms: {}
    },

    ui: {
        vertexSource: ShaderSources.ui_vertex,
        fragmentSource: ShaderSources.ui_fragment,
        attributes: {
            a_position: {
                size: 3,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 6 * Float32Array.BYTES_PER_ELEMENT,
                offset: 0,
            },
            a_texCoord: {
                size: 2,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 6 * Float32Array.BYTES_PER_ELEMENT,
                offset: 3 * Float32Array.BYTES_PER_ELEMENT,
            },
            a_opacity: {
                size: 1,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 6 * Float32Array.BYTES_PER_ELEMENT,
                offset: 5 * Float32Array.BYTES_PER_ELEMENT,
            }
        },
        uniforms: {
            u_projectionMatrix: 'Matrix4fv',
            u_viewMatrix: 'Matrix4fv',
            u_brightness: '1f',
        }
    }
}