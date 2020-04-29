import { WebglDrawData } from "../Models/WebglDrawData";

class WebglProxy {
    //@ts-ignore
    private _wg = window.webglDef;

    Init = (vertexSource: string, fragmentSource: string, canvas: HTMLCanvasElement, imagesArray: HTMLImageElement[]) =>
        this._wg.init(vertexSource, fragmentSource, canvas, imagesArray);

    SetCameraFrustum = (horizontal: number | null = null, vertical: number | null = null, near: number | null = null, far: number | null = null) =>
        this._wg.setCameraFrustum(horizontal, vertical, near, far);

    TranslateCamera = (x: number = 0, y: number = 0) =>
        this._wg.translateCamera(x, y);

    SetCameraTranslation = (x: number | null = null, y: number | null = null) =>
        this._wg.setCameraTranslation(x, y);

    RotateCamera = (degrees: number) =>
        this._wg.rotateCamera(degrees);

    SetCameraRotation = (degrees: number) =>
        this._wg.setCameraRotation(degrees);

    Draw = () =>
        this._wg.draw();

    SetTriangleData = (data: WebglDrawData) =>
        this._wg.setTriangleData(data.vertexes, data.indexes);

    SetLineData = (data: WebglDrawData[]) =>
        this._wg.setLineData(data);
}

export const Webgl = new WebglProxy();