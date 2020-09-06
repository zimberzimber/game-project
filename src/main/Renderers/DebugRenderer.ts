import { WebglRenderer } from "./BaseRenderer";
import { IRendererConfig } from "./_RendererInterfaces";

export class WebglDebugRenderer extends WebglRenderer {
    private _drawData: Float32Array[] = [];
    private readonly _attributeCount: number = 0;

    constructor(canvas: HTMLCanvasElement, config: IRendererConfig) {
        super(canvas, config)

        for (const attribute in config.attributes)
            this._attributeCount += config.attributes[attribute].size;
    }

    SetDrawData(data: number[][] | null): void {
        this._drawData = [];

        if (data)
            data.forEach(numArr => this._drawData.push(new Float32Array(numArr)));
    }

    ActivateProgram(): void {
        super.ActivateProgram();
        const gl = this._context;
        gl.disable(gl.BLEND);
        gl.disable(gl.DEPTH_TEST);
    }

    Render(): void {
        if (!this._drawData) return;

        this.ActivateProgram();
        const gl = this._context;

        this._drawData.forEach(data => {
            gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
            gl.drawArrays(gl.LINE_LOOP, 0, data.length / this._attributeCount);
        })
    }
}