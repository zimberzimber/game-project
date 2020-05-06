export class ShaderSourcesProxy {
    //@ts-ignore
    private _source = window.shaderSources;

    get VertexShader(): string { return this._source.vertex; }
    get FragmentShader(): string { return this._source.fragment; }
}

export const ShaderSources = new ShaderSourcesProxy();