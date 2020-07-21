import { WebglRenderer } from "./BaseRenderer";
import { IRendererConfig } from "./_RendererInterfaces";

export class WebglLightingRenderer extends WebglRenderer {
    private _drawData: Float32Array = new Float32Array([]);
    private readonly _attributeCount: number = 0;

    constructor(canvas: HTMLCanvasElement, config: IRendererConfig) {
        super(canvas, config)

        for (const attribute in config.attributes)
            this._attributeCount += config.attributes[attribute].size;
    }

    SetDrawData(data: number[]): void {
        this._drawData = new Float32Array(data);
    }

    ActivateProgram(): void {
        super.ActivateProgram();
        const gl = this._context;
        gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
        gl.enable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
    }

    Render(): void {
        this.ActivateProgram();
        const gl = this._context;

        gl.bufferData(gl.ARRAY_BUFFER, this._drawData, gl.DYNAMIC_DRAW);
        gl.drawArrays(gl.POINTS, 0, this._drawData.length / this._attributeCount);
    }
}