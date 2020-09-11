import { UiEntityBase } from "../EntityBase";
import { IGenericCallback } from "../../Models/GenericInterfaces";

export class WindowBaseEntity extends UiEntityBase {
    private _closeCallback: undefined | IGenericCallback;
    set OnClose(callback: undefined | IGenericCallback) {
        this._closeCallback = callback;
    }

    protected _closeCallbackArgs: any;

    CloseWindow() {
        if (this._closeCallback)
            this._closeCallback(this._closeCallbackArgs);
        this.Delete();
    }
}