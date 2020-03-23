
export interface IDOMDependant {
    OnDomLoaded(): void;
}

import { ImageDrawDirectiveData } from "../Models/ImageDrawDirectiveData";
export interface ISpriteAtlas extends IDOMDependant {
    GetSprite(spriteName: string): ImageDrawDirectiveData;
}