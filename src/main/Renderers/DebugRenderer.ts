import { WebglRenderer } from "./BaseRenderer";
import { IRendererConfig } from "./_RendererInterfaces";

interface DebugRendererDrawData {
    yellow: Float32Array[],
    red: Float32Array[]
}

export class WebglDebugRenderer extends WebglRenderer {
    private _drawData: DebugRendererDrawData = { yellow: [], red: [] };
    private readonly _attributeCount: number = 0;

    constructor(canvas: HTMLCanvasElement, config: IRendererConfig) {
        super(canvas, config)

        for (const attribute in config.attributes)
            this._attributeCount += config.attributes[attribute].size;
    }

    SetDrawData(data: { yellow: number[][], red: number[][] } | null): void {
        this._drawData = { yellow: [], red: [] };

        if (data !== null) {
            data.yellow.forEach(numArr => this._drawData.yellow.push(new Float32Array(numArr)));
            data.red.forEach(numArr => this._drawData.red.push(new Float32Array(numArr)));
        }
    }

    Render(): void {
        if (!this._drawData) return;

        this.ActivateProgram();
        const gl = this._context;

        if (this._drawData.yellow.length > 0) {
            this._drawData.yellow.forEach(data => {
                gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
                gl.drawArrays(gl.LINE_LOOP, 0, data.length / this._attributeCount);
            })
        }

        if (this._drawData.red.length > 0) {
            this._drawData.red.forEach(data => {
                gl.bufferData(gl.ARRAY_BUFFER, data, gl.DYNAMIC_DRAW);
                gl.drawArrays(gl.LINE_LOOP, 0, data.length / this._attributeCount);
            })
        }
    }
}