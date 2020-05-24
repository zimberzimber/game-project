
export interface RendererUniformContainer {
    index: WebGLUniformLocation;
    type: string;
    data: any[];
}

export interface RendererAttributeContainer {
    index: number;
    definition: WebglAttributeDefinition;
}

export interface WebglAttributeDefinition {
    readonly size: number;
    readonly type: number;
    readonly normalized: boolean;
    readonly stride: number;
    readonly offset: number;
}

export interface RendererAttributeDefinitions {
    [key: string]: WebglAttributeDefinition;
}

export interface RendererUniformDefinitions {
    [key: string]: string;
}

export interface SceneRendererDrawData {
    [key: number]: {
        attributes: Float32Array,
        indexes: Uint16Array,
    }
}

export interface RendererConfig {
    vertexSource: string;
    fragmentSource: string;
    attributes: RendererAttributeDefinitions;
    uniforms: RendererUniformDefinitions;
}