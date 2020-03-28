import { WebglDrawData } from "../Models/WebglDrawData";

class WebglProxy {
    //@ts-ignore
    private wg: any = window.webglDef;

    Init = (vertexSource: string, fragmentSource: string, canvas: any, spriteSheet: any) =>
        this.wg.init(vertexSource, fragmentSource, canvas, spriteSheet);

    SetCameraFrustum = (horizontal: number | null = null, vertical: number | null = null, near: number | null = null, far: number | null = null) =>
        this.wg.setCameraFrustum(horizontal, vertical, near, far);

    TranslateCamera = (x: number = 0, y: number = 0) =>
        this.wg.translateCamera(x, y);

    SetCameraTranslation = (x: number | null = null, y: number | null = null) =>
        this.wg.setCameraTranslation(x, y);

    RotateCamera = (degrees: number) =>
        this.wg.rotateCamera(degrees);

    SetCameraRotation = (degrees: number) =>
        this.wg.setCameraRotation(degrees);

    Draw = () =>
        this.wg.draw();

    SetTriangleData = (data: WebglDrawData) =>
        this.wg.setTriangleData(data.vertexes, data.indexes);

    SetLineData = (data: WebglDrawData[]) =>
        this.wg.setLineData(data);
}

const webglProxy = new WebglProxy();
export default webglProxy;