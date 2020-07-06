
export interface IRendererUniformContainer {
    index: WebGLUniformLocation;
    type: string;
    data: any[];
}

export interface IRendererAttributeContainer {
    index: number;
    definition: IWebglAttributeDefinition;
}

export interface IWebglAttributeDefinition {
    readonly size: number;
    readonly type: number;
    readonly normalized: boolean;
    readonly stride: number;
    readonly offset: number;
}

export interface IRendererAttributeDefinitions {
    [key: string]: IWebglAttributeDefinition;
}

export interface IRendererUniformDefinitions {
    [key: string]: string;
}

export interface ISceneRendererDrawData {
    [key: number]: IAttributesIndexesTyped;
}

export interface IAttributesIndexes {
    attributes: number[],
    indexes: number[],
}

export interface IAttributesIndexesTyped {
    attributes: Float32Array,
    indexes: Uint16Array,
}

export interface IRendererConfig {
    vertexSource: string;
    fragmentSource: string;
    attributes: IRendererAttributeDefinitions;
    uniforms: IRendererUniformDefinitions;
}

export interface IWebglActiveTextureInfo {
    uniformLocation: WebGLUniformLocation;
    textureUnit: number;
}