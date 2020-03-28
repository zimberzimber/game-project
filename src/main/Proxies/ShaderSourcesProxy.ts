class ShaderSourceProxy {
    //@ts-ignore
    private source: any = window.shaderSources;

    GetVertexShader = (): string => this.source.vertex;
    GetFragmentShader = (): string => this.source.fragment;
}

const shaderSourceProxy = new ShaderSourceProxy();
export default shaderSourceProxy;