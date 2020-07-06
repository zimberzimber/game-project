import { OneTimeLog } from "../Workers/OneTimeLogger";
import { LogLevel } from "../Workers/Logger";

class SharedWebglTextureContainer {
    private _textures: { [key: string]: WebGLTexture; } = {};

    GetTexture(id: number | string): WebGLTexture | undefined {
        return this._textures[id];
    }

    AddTexture(id: number | string, texture: WebGLTexture): void {
        if (this._textures[id])
            OneTimeLog.Log(`SHARED_TEXTURE_ID_TAKEN_${id}`, `Shared texture ID ${id} already in use.`, LogLevel.Warn);
        else
            this._textures[id] = texture;
    }

    Exists(id: number | string): boolean {
        return this._textures[id] ? true : false;
    }
}

export const SharedWebglTextures = new SharedWebglTextureContainer();