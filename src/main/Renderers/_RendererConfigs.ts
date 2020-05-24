import { RendererConfig } from "./_RendererInterfaces"
import { ShaderSources } from "../AssetDefinitions/ShaderDefinitions"

export const RenderConfigs: { [key: string]: RendererConfig } = {
    scene: {
        vertexSource: ShaderSources.scene_vertex,
        fragmentSource: ShaderSources.scene_fragment,
        attributes: {
            a_position: {
                size: 3,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 5 * Float32Array.BYTES_PER_ELEMENT,
                offset: 0,
            },
            a_texCoord: {
                size: 2,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 5 * Float32Array.BYTES_PER_ELEMENT,
                offset: 3 * Float32Array.BYTES_PER_ELEMENT,
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
                stride: 3 * Float32Array.BYTES_PER_ELEMENT,
                offset: 0,
            },
            a_colorIndex: {
                size: 1,
                type: WebGLRenderingContext.FLOAT,
                normalized: false,
                stride: 3 * Float32Array.BYTES_PER_ELEMENT,
                offset: 2 * Float32Array.BYTES_PER_ELEMENT,
            },
        },
        uniforms: {
            u_worldMatrix: 'Matrix4fv',
            u_projectionMatrix: 'Matrix4fv',
            u_viewMatrix: 'Matrix4fv',
        }
    }
}