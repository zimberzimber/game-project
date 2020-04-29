export class ShaderSourcesProxy {
    //@ts-ignore
    private _source = window.shaderSources;

    GetVertexShader = (): string => this._source.vertex;
    GetFragmentShader = (): string => this._source.fragment;
}

export const ShaderSources = new ShaderSourcesProxy();